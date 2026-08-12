/**
 * AITools.gs
 * SMART RT 07 RW 11 GPA NGIJO
 * TAHAP 8D — DELEGATION WRAPPER
 * 
 * [DEPRECATED WRAPPER]
 * Single Source of Truth for AI Tool Registry is AIToolRegistry.gs.
 */

function getAIToolDefinitionFromAITools(toolName) {
  if (typeof AI_TOOL_DEFINITIONS !== 'undefined') {
    return AI_TOOL_DEFINITIONS[toolName] || null;
  }
  return null;
}
