# build process
FROM node:10.11.0 as builder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ .
RUN yarn
RUN yarn run build
# EXPOSE 5000
# CMD [ "yarn", "start" ]

# production
FROM nginx:1.15.5
RUN rm -rf /etc/nginx/conf.d
COPY ./conf /etc/nginx
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
