from urllib.parse import urlparse, urlunparse


def get_base_url(url):
    parsed_url = urlparse(url)
    base_url = urlunparse((parsed_url.scheme,parsed_url.netloc,'','','',''))
    return base_url