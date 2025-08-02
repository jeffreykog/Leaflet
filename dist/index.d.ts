// Re-export all types from the main leaflet definition file
export * from './leaflet.d.ts';

// Default export for bundler compatibility
import * as L from './leaflet.d.ts';
export default L; 