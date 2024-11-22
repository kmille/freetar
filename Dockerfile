FROM python:3.12-alpine3.20 AS builder
RUN apk update
RUN apk add gcc musl-dev libffi-dev
RUN pip install poetry
COPY . /app
WORKDIR /app
RUN poetry build --format=wheel


FROM python:3.12-alpine3.20
ENV PYTHONUNBUFFERED=TRUE

COPY --from=builder /app/dist/*.whl .
RUN adduser -D freetar && \
    pip install *.whl && \
    rm *.whl

USER freetar
EXPOSE 22000

ENTRYPOINT ["/usr/local/bin/freetar"]
