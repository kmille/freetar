import importlib.metadata


def get_version():
    return importlib.metadata.version(__package__)
