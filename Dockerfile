# Define NodeJS version
ARG TARGET_NODE_VERSION=12

# Define NodeJS docker image
FROM node:${TARGET_NODE_VERSION}

MAINTAINER Adam Kadlec <adam.kadlec@fastybird.com>

################################
# CONTAINER REQUIRED ARGUMENTS #
################################

# App instalation folder
ARG APP_CODE_PATH=/usr/src/app
# Container default timezone
ARG APP_TZ=UTC

###########################
# CONTAINER CONFIGURATION #
###########################

# Set server timezone
RUN ln -snf /usr/share/zoneinfo/${APP_TZ} /etc/localtime && echo ${APP_TZ} > /etc/timezone

RUN apt-get update -yqq \
 && apt-get install -yqq \
 nano \
;

##############################
# IO SERVER APP INSTALLATION #
##############################

ADD ./assets ${APP_CODE_PATH}/assets
ADD ./components ${APP_CODE_PATH}/components
ADD ./configuration ${APP_CODE_PATH}/configuration
ADD ./helpers ${APP_CODE_PATH}/helpers
ADD ./layouts ${APP_CODE_PATH}/layouts
ADD ./locales ${APP_CODE_PATH}/locales
ADD ./middleware ${APP_CODE_PATH}/middleware
ADD ./mixins ${APP_CODE_PATH}/mixins
ADD ./models ${APP_CODE_PATH}/models
ADD ./pages ${APP_CODE_PATH}/pages
ADD ./plugins ${APP_CODE_PATH}/plugins
ADD ./static ${APP_CODE_PATH}/static
ADD ./store ${APP_CODE_PATH}/store
COPY ./jsconfig.json ${APP_CODE_PATH}/
COPY ./nuxt.config.js ${APP_CODE_PATH}/
COPY ./package.json ${APP_CODE_PATH}/
COPY ./tsconfig.json ${APP_CODE_PATH}/
COPY ./vue-shim.d.ts ${APP_CODE_PATH}/

# Install web app
RUN cd ${APP_CODE_PATH} \
 && yarn cache clean \
 && yarn install --network-timeout 1000000 \
 && yarn build \
;

#####################################
# FINISHING CONTAINER CONFIGURATION #
#####################################

WORKDIR "${APP_CODE_PATH}"

################
# MAIN COMMAND #
################

# Nuxt run command
CMD ["yarn", "start"]

EXPOSE 5000
