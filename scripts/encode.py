#!/usr/bin/env python
import sys
import base64

with open(sys.argv[1], 'rb') as im:
  data = base64.b64encode(im.read())

result = []
for ch in data:
	result.append('%c' % ch)
print('url(data:image/png;base64,%s);' % ''.join(result))