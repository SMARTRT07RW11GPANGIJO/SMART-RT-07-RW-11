/**
 * SMART RT 07 RW 11 PERUM GPA NGIJO - TAHAP 8I
 * Google Apps Script - AI Tool Registry Delegation Wrapper
 * 
 * [DEPRECATED WRAPPER]
 * Single Source of Truth is now AIToolRegistry.gs.
 * This function delegates to AIToolRegistry.gs getGAS_AIToolRegistry()
 * for backward compatibility.
 */

function getGAS_AIToolRegistry() {
  if (typeof AI_TOOL_DEFINITIONS !== 'undefined') {
    return AI_TOOL_DEFINITIONS;
  }
  return {};
}
