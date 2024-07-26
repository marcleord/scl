import { useMemo, useRef } from "react"
import { Marker, Popup } from "react-leaflet"
import * as L from "leaflet";

const LeafIcon = L.Icon.extend({
  options: {}
});

const redIcon = new LeafIcon({
  iconUrl:
    "/marker.png",
    iconSize: [32, 32]
})

const commonIcon = new LeafIcon({
  iconUrl:
    "/common-marker.png",
    iconSize: [32, 32]
})


export default function ({ latitude, longitude, draggable = true, setPosition, text, customIcon }: any) {
    const markerRef = useRef(null)
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker && setPosition) {
                const _pos = marker.getLatLng()
                console.log("_pos ", _pos)
                setPosition && setPosition({
                    latitude: _pos.lat,
                    longitude: _pos.lng,
                })
          }
        },
      }),
      [],
    )
  
    return (
      <Marker
        draggable={draggable}
        eventHandlers={eventHandlers}
        position={[latitude, longitude]}
        ref={markerRef}
        icon={customIcon ? redIcon : commonIcon}

        >
            {
                text && <Popup>
                {text}
            </Popup>
            }
      </Marker>
    )
}