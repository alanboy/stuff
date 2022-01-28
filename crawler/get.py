import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from urllib.parse import urljoin

#
# Add a found URL to the list of links
#
def add_url(url, href):
    #url_parsed = urlparse(href)
    #full_url = urljoin(url, href)
    #print(">>>>"+full_url)
    return

#
# Process a single URL
#
def process_url(url):
    #print("========== " + url + " ====================")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
    }
    html_text = requests.get(url, headers=headers).text
    soup = BeautifulSoup(html_text, 'html.parser')

    # Title
    print (soup.title.string)
    return

    # H1 elements usually have important information
    #h1_elements = soup.find_all('h1,h2')
    #for el in h1_elements:
    #    print(el.text)

    # meta elements have description and other keywords that are useful
    meta_elements = soup.find_all('meta')
    found_description = False
    for el in meta_elements:
        #print(el.attrs)
        if el.has_attr('name') and el['name'] == 'description':
            found_description = True
            print(el['content'])

    if not found_description:
        print(soup.title.string + ' No content')

    # links
    #a_elements = soup.find_all('a')
    #for el in a_elements:
    #    add_url(url, el.get("href").strip())

#
# Process the file
#
with open('urls.txt') as urls_file:
    for line in urls_file:
        if line.startswith("#"):
            continue
        process_url(line.strip())

