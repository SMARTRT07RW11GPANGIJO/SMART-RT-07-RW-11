import re

with open('src/components/facility/FacilityMap.tsx', 'r') as f:
    content = f.read()

content = content.replace("function MapPolygon({ paths, options }: { paths: {lat: number, lng: number}[], options: any }) {", "const MapPolygon: React.FC<{ paths: {lat: number, lng: number}[], options: any }> = ({ paths, options }) => {")
content = content.replace("function MapPolyline({ path, options }: { path: {lat: number, lng: number}[], options: any }) {", "const MapPolyline: React.FC<{ path: {lat: number, lng: number}[], options: any }> = ({ path, options }) => {")

with open('src/components/facility/FacilityMap.tsx', 'w') as f:
    f.write(content)

