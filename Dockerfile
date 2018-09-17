FROM node:6.10.3

# Install gem sass for  grunt-contrib-sass
RUN apt-get update -qq && apt-get install -y build-essential
RUN apt-get install -y ruby
RUN apt-get install -y ruby-dev
RUN gem update --system
RUN gem install sass

WORKDIR /home/mean

# Install Mean.JS Prerequisites
# RUN npm install -g grunt-cli
RUN npm install -g bower
RUN npm install -g gulp
RUN npm install -g gulp-cli

# Install Mean.JS packages
ADD package.json /home/mean/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/mean/.bowerrc
ADD bower.json /home/mean/bower.json
RUN bower install --config.interactive=false --allow-root

# Make everything available for start
ADD . /home/mean

# Set development environment as default
ENV NODE_ENV production
ENV FACEBOOK_ID 108325769791251
ENV FACEBOOK_SECRET d98ea9d0b1ac88ff367d96e510c71e62
ENV GOOGLE_ID 319656309726-9i9u5rpoot9c0ku4ujcth14k9ej3ia5k.apps.googleusercontent.com
ENV GOOGLE_SECRET KEijKPDM4gzwDgyvNI_vfwPP
ENV MAILER_EMAIL_ID cc4b0988109a806d248bd4d6c553fab8
ENV MAILER_FROM rohan@nobit.tech
ENV MAILER_PASSWORD 12ebe23aa549ed343fb67c9d5f4ea999
ENV MAILER_SERVICE_PROVIDER Mailjet
ENV MAILER_TO dion@newvote.org.au
ENV MONGODB_URI mongodb://newvote-admin:newvoteit3@ds259865.mlab.com:59865/newvote
ENV RECAPTCHA_SECRET 6LdlgVcUAAAAAH4AgfE6YkJzN9mGb7aIzClyFAOL
ENV SMS_PASSWORD newvoteit3
ENV SMS_USERNAME newvote

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 80 8443
CMD ["sh", "-c", "gulp prod"]
