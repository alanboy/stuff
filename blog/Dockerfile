FROM ruby:3.1-alpine

# Add Jekyll dependencies
RUN apk add --no-cache build-base gcc cmake git

# Set working directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY Gemfile* ./

# Copy the custom theme
COPY alanboy-theme ./alanboy-theme

# Install dependencies
RUN bundle install

# Copy specific files and directories
COPY _config.yml .
COPY *.md .
COPY *.html .
COPY favicon.ico .
COPY assets assets/

# Create posts directory
RUN mkdir -p _posts

# Set up volume for _posts directory
VOLUME ["/app/_posts"]

# Expose port 4000 for Jekyll server
EXPOSE 4000

# Command to run when container starts
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--incremental", "--watch"]
