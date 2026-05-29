import importlib.metadata


def get_version():
    try:
        return importlib.metadata.version(__package__)
    except importlib.metadata.PackageNotFoundError:
        return 'development'

def get_bootstrap_colors():
    return [
      "--bs-body-color", "--bs-secondary-color", "--bs-tertiary-color",
      "--bs-teal", "--bs-success", "--bs-success-border-subtle",
      "--bs-info", "--bs-primary", "--bs-primary-border-subtle",
      "--bs-pink", "--bs-purple", "--bs-indigo",
      "--bs-warning", "--bs-danger", "--bs-danger-border-subtle",
    ]

class FreetarError(Exception):
    pass
