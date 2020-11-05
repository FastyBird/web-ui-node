# FastyBird Web UI node

## What is FastyBird Web UI node?

Web UI node is a user interface microservice for visual controlling devices & other microservices.

FastyBird Web UI node is an Apache2 licensed distributed web app microservice, developed in JS with [NuxtJS framework](https://nuxtjs.org/).

## Requirements

FastyBird Web UI node is tested against ECMAScript 6

## Getting started

> **NOTE:** If you don't want to install it manually, try [docker image](#install-with-docker)

The best way to install **fastybird/web-ui-node** is using [Yarn](https://yarnpkg.com/). If you don't have Yarn yet, [download it](https://classic.yarnpkg.com/en/docs/install#search-stable) following the instructions.
Then use command:

```sh
$ git clone git@github.com:FastyBird/web-ui-node.git path/to/install
$ cd path/to/install
$ yarn install
```

Everything required will be then installed in the provided folder `path/to/install`

This microservice is composed from console commands.

##### Development mode

```sh
$ yarn dev
```

This command will start web app in development mode available as http://localhost:3000

##### Build mode & production mode

```sh
$ yarn build
$ yarn start
```

This command build app from source files and start node server which is listening for incoming http requests.

## Install with docker

![Docker Image Version (latest by date)](https://img.shields.io/docker/v/fastybird/web-ui-node?style=flat-square)
![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/fastybird/web-ui-node?style=flat-square)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fastybird/web-ui-node?style=flat-square)

Docker image: [fastybird/web-ui-node](https://hub.docker.com/r/fastybird/web-ui-node/)

### Use docker hub image

```bash
$ docker run -d -it --name web-ui fastybird/web-ui-node:latest
```

### Generate local image

```bash
$ docker build --tag=web-ui-node .
$ docker run -d -it --name web-ui-node web-ui-node
```

## Configuration

This microservices is preconfigured for default connections, but your infrastructure could be different.

Configuration could be made via environment variables:

| Environment Variable | Description |
| ---------------------- | ---------------------------- |
| `NUXT_ENV_I18N_LOCALE=en` | Default app locale (avail.: en) |
| `NUXT_ENV_I18N_FALLBACK_LOCALE=en` | Fallback locale for unknown locale |
| `FB_NODE_PARAMETER__RABBITMQ_PORT=5672` | RabbitMQ access port |
| `NUXT_ENV_MQTT_SERVER_ADDRESS=` | MQTT server address for ui purposes |
| `NUXT_ENV_API_KEY=` | API key allowing access to gateway service |
| `NUXT_ENV_API_TARGET=localhost/api` | API gateway node address |
| `NUXT_ENV_WS_KEY=` | WS key allowing access to websockets servce |
| `NUXT_ENV_WS_TARGET=localhost/ws-server` | WS server node address |
| | |
| `NUXT_ENV_SENTRY_DNS=` | Sentry bugtracking DSN |
| `NUXT_ENV_SENTRY_ENV=` | Sentry env name, if empty, node env is used |

## Feedback

Use the [issue tracker](https://github.com/FastyBird/web-ui-node/issues) for bugs or [mail](mailto:info@fastybird.com) or [Tweet](https://twitter.com/fastybird) us for any idea that can improve the project.

Thank you for testing, reporting and contributing.

## Changelog

For release info check [release page](https://github.com/FastyBird/web-ui-node/releases)

## Maintainers

<table>
	<tbody>
		<tr>
			<td align="center">
				<a href="https://github.com/akadlec">
					<img width="80" height="80" src="https://avatars3.githubusercontent.com/u/1866672?s=460&amp;v=4">
				</a>
				<br>
				<a href="https://github.com/akadlec">Adam Kadlec</a>
			</td>
		</tr>
	</tbody>
</table>

***
Homepage [http://www.fastybird.com](http://www.fastybird.com) and repository [http://github.com/fastybird/web-ui-node](http://github.com/fastybird/web-ui-node).
