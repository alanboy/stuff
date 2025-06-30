# Alan's Blog - Docker Setup Guide

This repository contains a Jekyll-based blog. Follow these instructions to run the blog locally using Docker, without having to install Ruby or any other dependencies directly on your machine.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Docker** - Download and install from [Docker's official website](https://www.docker.com/get-started)
2. **Docker Compose** (usually included with Docker Desktop)

## Running with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Start the Jekyll server**:
   ```bash
   docker-compose up
   ```

2. **Access the blog**:
   Open your browser and navigate to `http://localhost:4000`

3. **Stop the server**:
   Press `Ctrl+C` in the terminal, or run:
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker Directly

1. **Build the Docker image**:
   ```bash
   docker build -t jekyll-blog .
   ```

2. **Run the container**:
   ```bash
   docker run -p 4000:4000 -v $(pwd):/app jekyll-blog
   ```

3. **Access the blog**:
   Open your browser and navigate to `http://localhost:4000`

## Creating New Posts

You can create new posts manually in the `_posts` directory following Jekyll's naming convention (`YYYY-MM-DD-title.md`), or use the provided script:
```
./newpost.cmd "Your Post Title"
```

## Customization

- Edit `_config.yml` to change site settings
- Modify files in the `alanboy-theme` directory to customize the theme

## Troubleshooting

If you encounter any issues:

1. Make sure all prerequisites are installed correctly
2. Try running `bundle update` to update all gems
3. Check Jekyll's [troubleshooting guide](https://jekyllrb.com/docs/troubleshooting/)

## Additional Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Bundler Documentation](https://bundler.io/)
