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

# Copy the rest of the application
COPY . .

# Expose port 4000 for Jekyll server
EXPOSE 4000

# Command to run when container starts
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
