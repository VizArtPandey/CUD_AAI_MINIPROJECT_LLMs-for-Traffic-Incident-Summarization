# Stage 1: Build the React Frontend
FROM node:20-alpine AS build-step

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Serve with Python FastAPI
FROM python:3.10-slim

# Set up a new user named "user" with user ID 1000 (Required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /home/user/app

# Copy requirement files and install Python dependencies
COPY --chown=user:user requirements.txt ./
# We install torch CPU version to save space/memory if GPU is unavailable, though HF Spaces gives regular instances depending on config
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project code into the container
COPY --chown=user:user . .

# Copy the compiled React frontend from the build stage into the backend's reach
COPY --from=build-step --chown=user:user /app/frontend/dist ./frontend/dist

# Expose the standard port Hugging Face Spaces expects
EXPOSE 7860

# We mount the HF Spaces cache directory for transformers to avoid downloading models on every restart
ENV TRANSFORMERS_CACHE="/home/user/app/.cache/huggingface"

# Run the FastAPI app on port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
