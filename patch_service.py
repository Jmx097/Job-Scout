import subprocess
import json
import sys

def main():
    print("Fetching service config...")
    cmd = ["gcloud", "run", "services", "describe", "job-scout-api", "--region", "us-central1", "--format", "json"]
    # On Windows, shell=True is often needed for batch files/cmd wrappers
    result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    
    if result.returncode != 0:
        print(f"Error fetching config: {result.stderr}")
        sys.exit(1)
        
    service = json.loads(result.stdout)

    # Define the new environment variables
    # Note: We rely on the Dockerfile CMD starting with 'sh -c' and using $PORT
    new_env_vars = [
        {"name": "ENCRYPTION_KEY", "value": "rpgs-X_WJ3i0mo1t135NPpCo7v3wd9EKDnyosCw7_7g="},
        {"name": "CLERK_SECRET_KEY", "value": "sk_test_WlK4ecdT8XFbi6dQWKh408P168mftkapYM7aIIU8EP"},
        {"name": "CLERK_ISSUER", "value": "https://live-coyote-24.clerk.accounts.dev"},
        {"name": "DATABASE_URL", "value": "sqlite+aiosqlite:///./data/jobscout.db"},
        {"name": "CORS_ORIGINS", "value": "[\"*\"]"} 
    ]

    # Locate the container spec
    # Standard Cloud Run structure: spec -> template -> spec -> containers -> [0]
    try:
        containers = service["spec"]["template"]["spec"]["containers"]
        # Update the first container (usually only one)
        containers[0]["env"] = new_env_vars
        
        # Ensure image is pointing to the latest one we built? 
        # Actually gcloud replace keeps the image ref if we don't change it.
        # But we want to Ensure it uses the one referenced in status technically? 
        # No, "replace" updates the spec.
        
        # WE MUST REMOVE "status" fields to avoid conflicts usually, 
        # but "gcloud run services replace" handles a full export usually.
        # However, it's safer to remove "status".
        if "status" in service:
            del service["status"]
            
    except KeyError as e:
        print(f"Error parsing service JSON: {e}")
        sys.exit(1)

    print("Writing service.json...")
    with open("service.json", "w") as f:
        json.dump(service, f, indent=2)

    print("Done. Now run: gcloud run services replace service.json --region us-central1")

if __name__ == "__main__":
    main()
