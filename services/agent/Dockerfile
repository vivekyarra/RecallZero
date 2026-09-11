FROM public.ecr.aws/docker/library/python:3.13-slim

WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir .
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "main.py"]

