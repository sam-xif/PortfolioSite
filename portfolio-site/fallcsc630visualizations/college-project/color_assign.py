TEXT = """USA
United Kingdom
Japan
Switzerland
Israel
Canada
France
Sweden
South Korea
Italy
Germany
Netherlands
Finland
Norway
Australia
Denmark
Singapore
Russia
China
Taiwan
Belgium
South Africa
Spain
Brazil
Hong Kong
Ireland
Austria
New Zealand
Portugal
Thailand
Czech Republic
Malaysia
India
Greece
Mexico
Hungary
Argentina
Turkey
Poland
Saudi Arabia
Chile
Iceland
Slovenia
Estonia
Lebanon
Croatia
Colombia
Slovak Republic
Iran
Egypt
Serbia
Bulgaria
Lithuania
Uganda
United Arab Emirates
Uruguay
Cyprus
Romania
Puerto Rico"""

import random

def makeRow(x):
    r = random.randint(0, 255)
    g = random.randint(0, 255)
    b = random.randint(0, 255)
    
    hex = '#{:02X}{:02X}{:02X}'.format(r, g, b)
    
    return '"{0}":"{1}"'.format(x, hex)
        

countries = TEXT.replace('\r', '').split('\n')
buffer = ""
with open("countries.json", "w+") as f:
    buffer += '{'
    buffer += ','.join([makeRow(x) for x in countries])
    buffer += '}'
    
    f.write(buffer)
