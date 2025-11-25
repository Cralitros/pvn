// models/organigrama.model.ts
export interface OrgNode {
    id: string;
    name: string;
    title?: string;
    children?: OrgNode[];
}