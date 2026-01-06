"""
Resume parsing service with experience and education extraction.
Parses PDF, DOCX, TXT to JSON Resume schema.
"""
import io
import re
from typing import Dict, Any, List
import pypdf
from docx import Document


async def parse_resume(content: bytes, file_extension: str) -> Dict[str, Any]:
    """
    Parse resume content from various file formats.
    Returns structured JSON Resume data.
    """
    text = ""
    
    if file_extension == ".pdf":
        text = _extract_pdf_text(content)
    elif file_extension in [".docx", ".doc"]:
        text = _extract_docx_text(content)
    elif file_extension == ".txt":
        text = content.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")
    
    # Parse the extracted text
    return _parse_resume_text(text)


def _extract_pdf_text(content: bytes) -> str:
    """Extract text from PDF."""
    reader = pypdf.PdfReader(io.BytesIO(content))
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts)


def _extract_docx_text(content: bytes) -> str:
    """Extract text from DOCX."""
    doc = Document(io.BytesIO(content))
    text_parts = []
    for para in doc.paragraphs:
        text_parts.append(para.text)
    return "\n".join(text_parts)


def _parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Parse resume text into JSON Resume schema.
    Extracts: contact info, skills, experience, education.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    result = {
        "full_name": "",
        "email": "",
        "phone": None,
        "location": None,
        "summary": None,
        "skills": [],
        "experience": [],
        "education": [],
    }
    
    # Extract email
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, text)
    if emails:
        result["email"] = emails[0]
    
    # Extract phone
    phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
    phones = re.findall(phone_pattern, text)
    if phones:
        # Clean up phone number
        phone = re.sub(r'[^\d\+\-\(\)\s]', '', phones[0]).strip()
        if len(phone) >= 10:
            result["phone"] = phone
    
    # First non-empty line is often the name
    if lines:
        potential_name = lines[0]
        if len(potential_name) < 50 and "@" not in potential_name and not any(c.isdigit() for c in potential_name[:5]):
            result["full_name"] = potential_name
    
    # Identify sections
    section_keywords = {
        "skills": ["skills", "technologies", "technical skills", "proficiencies", "competencies", "expertise"],
        "experience": ["experience", "work experience", "employment", "work history", "professional experience"],
        "education": ["education", "academic", "degrees", "qualifications"],
        "summary": ["summary", "objective", "profile", "about"],
    }
    
    current_section = None
    section_content: Dict[str, List[str]] = {k: [] for k in section_keywords}
    
    for line in lines:
        lower_line = line.lower()
        
        # Check if this line is a section header
        found_section = None
        for section, keywords in section_keywords.items():
            if any(kw in lower_line and len(lower_line) < 40 for kw in keywords):
                found_section = section
                break
        
        if found_section:
            current_section = found_section
            continue
        
        if current_section:
            section_content[current_section].append(line)
    
    # Parse skills
    result["skills"] = _parse_skills(section_content["skills"])
    
    # Parse experience
    result["experience"] = _parse_experience(section_content["experience"])
    
    # Parse education
    result["education"] = _parse_education(section_content["education"])
    
    # Parse summary
    if section_content["summary"]:
        result["summary"] = " ".join(section_content["summary"][:3])
    
    return result


def _parse_skills(lines: List[str]) -> List[str]:
    """Extract skills from skills section."""
    skills = []
    skill_separators = [",", "|", "•", "·", "–", ";"]
    
    for line in lines:
        # Try splitting by separators
        for sep in skill_separators:
            if sep in line:
                parts = [s.strip() for s in line.split(sep) if s.strip()]
                skills.extend(parts)
                break
        else:
            # Single skill or phrase
            if len(line) < 50 and line:
                skills.append(line)
    
    # Clean up: remove duplicates, filter short/invalid
    cleaned = []
    seen = set()
    for skill in skills:
        # Remove bullets and clean
        skill = re.sub(r'^[\-\*\•\·]\s*', '', skill).strip()
        skill_lower = skill.lower()
        if skill and len(skill) > 1 and skill_lower not in seen:
            seen.add(skill_lower)
            cleaned.append(skill)
    
    return cleaned[:30]


def _parse_experience(lines: List[str]) -> List[Dict[str, Any]]:
    """Extract work experience entries."""
    experiences = []
    current_exp: Dict[str, Any] = {}
    
    # Date patterns
    date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.,]*\d{4}|\d{1,2}/\d{4}|\d{4})'
    
    for line in lines:
        # Check if this looks like a job title/company line
        dates = re.findall(date_pattern, line, re.IGNORECASE)
        
        if dates and len(dates) >= 1:
            # This might be a new job entry header
            if current_exp.get("title"):
                experiences.append(current_exp)
            
            # Parse the line for title and company
            # Remove dates from line to get title/company
            clean_line = re.sub(date_pattern, '', line, flags=re.IGNORECASE).strip()
            clean_line = re.sub(r'[\-–—]', ' - ', clean_line)
            clean_line = re.sub(r'\s+', ' ', clean_line)
            
            parts = [p.strip() for p in re.split(r'\s*[\-–—,@]\s*', clean_line) if p.strip()]
            
            current_exp = {
                "title": parts[0] if parts else "",
                "company": parts[1] if len(parts) > 1 else "",
                "start_date": dates[0] if dates else None,
                "end_date": dates[1] if len(dates) > 1 else "Present",
                "description": "",
            }
        elif current_exp:
            # Add to description
            current_exp["description"] = (current_exp.get("description", "") + " " + line).strip()
    
    if current_exp.get("title"):
        experiences.append(current_exp)
    
    # Truncate descriptions
    for exp in experiences:
        if exp.get("description") and len(exp["description"]) > 500:
            exp["description"] = exp["description"][:500] + "..."
    
    return experiences[:10]


def _parse_education(lines: List[str]) -> List[Dict[str, Any]]:
    """Extract education entries."""
    education = []
    current_edu: Dict[str, Any] = {}
    
    degree_keywords = ["bachelor", "master", "phd", "doctorate", "associate", "mba", "bs", "ba", "ms", "ma", "b.s.", "b.a.", "m.s.", "m.a."]
    date_pattern = r'(\d{4})'
    
    for line in lines:
        lower_line = line.lower()
        
        # Check for degree keywords
        has_degree = any(kw in lower_line for kw in degree_keywords)
        dates = re.findall(date_pattern, line)
        
        if has_degree or dates:
            if current_edu.get("institution"):
                education.append(current_edu)
            
            # Try to parse degree and institution
            parts = [p.strip() for p in re.split(r'\s*[\-–—,]\s*', line) if p.strip()]
            
            # Determine which part is degree vs institution
            degree = ""
            institution = ""
            field = ""
            
            for part in parts:
                part_lower = part.lower()
                if any(kw in part_lower for kw in degree_keywords):
                    degree = part
                elif "university" in part_lower or "college" in part_lower or "institute" in part_lower:
                    institution = part
                elif not field and len(part) > 3:
                    field = part
            
            # If no clear split, use first part as institution
            if not institution and parts:
                institution = parts[0]
            
            current_edu = {
                "institution": institution,
                "degree": degree,
                "field": field,
                "graduation_date": dates[-1] if dates else None,
            }
        elif current_edu and line:
            # Add as field of study if not set
            if not current_edu.get("field"):
                current_edu["field"] = line
    
    if current_edu.get("institution"):
        education.append(current_edu)
    
    return education[:5]
