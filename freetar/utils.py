import importlib.metadata


def get_version():
    try:
        return importlib.metadata.version(__package__)
    except importlib.metadata.PackageNotFoundError:
        return 'development'


class FreetarError(Exception):
    pass
