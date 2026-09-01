export interface ParsedResource {
  type: string;
  name: string;
  attributes: Record<string, any>;
  blocks: Record<string, any[]>;
}