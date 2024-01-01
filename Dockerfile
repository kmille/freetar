FROM python:3.11-alpine3.18 AS builder
RUN pip install poetry
COPY . /app
WORKDIR /app
RUN poetry build --format=wheel


FROM python:3.11-alpine3.18
ENV PYTHONUNBUFFERED=TRUE

COPY --from=builder /app/dist/*.whl .
RUN adduser -D freetar && \
    pip install *.whl && \
    rm *.whl

USER freetar
EXPOSE 22000

ENTRYPOINT ["/usr/local/bin/freetar"]
