FROM python:3.11-slim

WORKDIR /app

# copy requirements from same dir as Dockerfile
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# copy the rest of the API code
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
