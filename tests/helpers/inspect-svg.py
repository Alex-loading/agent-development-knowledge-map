import json
import sys
import xml.etree.ElementTree as ET


document = ET.parse(sys.argv[1])
rectangles = document.findall('.//{http://www.w3.org/2000/svg}rect')
bars = [dict(rectangle.attrib) for rectangle in rectangles if 'data-kind' in rectangle.attrib]
print(json.dumps(bars))
