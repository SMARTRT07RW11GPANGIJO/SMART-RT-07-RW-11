// SMART RT 07 RW 11 GPA NGIJO - OPENSTREETMAP ADAPTER v1.0
// Module: SMART RT EXTERNAL SERVICE INTEGRATION v1.0 (CR-SMART-RT-EXTERNAL-001)

import { ExternalDataSanitizer } from '../externalDataSanitizer';

export class OsmMapAdapter {
  private static readonly APPROVED_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  private static readonly ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  /**
   * Get approved tile endpoint with attribution
   */
  static getTileConfiguration() {
    return {
      tileUrl: this.APPROVED_TILE_URL,
      attribution: this.ATTRIBUTION,
      maxZoom: 19,
      minZoom: 14,
      subdomains: ['a', 'b', 'c']
    };
  }

  /**
   * Sanitize geospatial marker parameters before sending to client map engine
   */
  static sanitizeMapMarkers(rawMarkers: Record<string, any>[]): Record<string, any>[] {
    const cleanList: Record<string, any>[] = [];
    for (const marker of rawMarkers) {
      const sanitized = ExternalDataSanitizer.sanitizeOutboundPayload('OSM_MAP', marker);
      if (sanitized.isValid) {
        cleanList.push(sanitized.sanitizedData);
      }
    }
    return cleanList;
  }
}
