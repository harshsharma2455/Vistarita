import { ComponentType } from 'react';
import { NodeProps } from '@xyflow/react';

import { CodeNode } from '../components/nodes/CodeNode';
import { ImageNode } from '../components/nodes/ImageNode';
import { NoteNode } from '../components/nodes/NoteNode';
import { PDFNode } from '../components/nodes/PDFNode';
import { TableNode } from '../components/nodes/TableNode';

import { ShapeNode } from '../components/nodes/ShapeNode';

export interface NodeDefinition {
    type: string;
    label: string;
    component: ComponentType<NodeProps<any>>;
    defaultData: Record<string, any>;
}

export const nodeRegistry: Record<string, NodeDefinition> = {
    note: {
        type: 'note',
        label: 'Note',
        component: NoteNode,
        defaultData: { text: 'New Note' },
    },
    shape: {
        type: 'shape',
        label: 'Shape',
        component: ShapeNode,
        defaultData: { shapeType: 'rectangle', text: '', color: '#e2e8f0' },
    },
    code: {
        type: 'code',
        label: 'Code Snippet',
        component: CodeNode,
        defaultData: { code: '// New Code Snippet', language: 'javascript' },
    },
    image: {
        type: 'image',
        label: 'Image',
        component: ImageNode,
        defaultData: { src: 'https://source.unsplash.com/random/400x300', label: 'New Image' },
    },
    pdf: {
        type: 'pdf',
        label: 'PDF Document',
        component: PDFNode,
        defaultData: { file: null, label: 'New PDF' },
    },
    table: {
        type: 'table',
        label: 'Data Table',
        component: TableNode,
        defaultData: { headers: ['Col 1', 'Col 2'], rows: [['Data 1', 'Data 2']], label: 'New Table' },
    },
};

export const getNodeTypes = () => {
    const types: Record<string, ComponentType<NodeProps<any>>> = {};
    Object.values(nodeRegistry).forEach((def) => {
        types[def.type] = def.component;
    });
    return types;
};
