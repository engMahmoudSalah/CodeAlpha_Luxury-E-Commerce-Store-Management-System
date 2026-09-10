#!/bin/bash
mkdir -p src/assets/tiles

IMG="/app/applet/src/assets/images/regenerated_image_1787114260183.jpg"

# 1. Main 4 quadrants
convert "$IMG" -crop 683x384+0+0 +repage src/assets/tiles/ms_logo_white.jpg
convert "$IMG" -crop 684x384+683+0 +repage src/assets/tiles/rack_green.jpg
convert "$IMG" -crop 683x384+0+384 +repage src/assets/tiles/folded_shirts_peach.jpg
convert "$IMG" -crop 684x384+683+384 +repage src/assets/tiles/tshirts_green.jpg

# 2. Sub-crops for versatile faces
# Folded shirts stack only
convert "$IMG" -crop 420x384+0+384 +repage src/assets/tiles/folded_shirts_only.jpg
# Fakhama logo block
convert "$IMG" -crop 260x384+420+384 +repage src/assets/tiles/fakhama_brand_peach.jpg
# Grey tshirt on green
convert "$IMG" -crop 340x384+683+384 +repage src/assets/tiles/grey_tshirt_green.jpg
# Black tshirt on green
convert "$IMG" -crop 340x384+1023+384 +repage src/assets/tiles/black_tshirt_green.jpg

ls -la src/assets/tiles/
