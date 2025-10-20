import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Link from '@tiptap/extension-link';
import { Card, Badge, Table as BootstrapTable } from 'react-bootstrap';
import { getImageUrl } from '../utils/imageUrl';
import TagBadge from './TagBadge';
import './ArticlePreview.css';

const ArticlePreview = ({ 
  title, 
  summary, 
  content, 
  category, 
  tags, 
  referenceRanges,
  featuredImage,
  deviceMode = 'desktop' // 'desktop' or 'mobile'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: content || '',
    editable: false,
    editorProps: {
      attributes: {
        class: 'article-preview-content',
      },
    },
  });

  // Update editor content when content prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`article-preview ${deviceMode === 'mobile' ? 'preview-mobile' : 'preview-desktop'}`}>
      <Card className="article-preview-card">
        <Card.Body>
          {title && <h1 className="article-preview-title">{title}</h1>}
          
          {(category || (tags && tags.length > 0)) && (
            <div className="article-preview-tags">
              {category && (
                <Badge bg="primary" className="me-2">{category}</Badge>
              )}
              {tags && tags.map((tag, index) => (
                <TagBadge key={index} tag={tag} clickable={false} />
              ))}
            </div>
          )}

          {featuredImage && (
            <div className="article-preview-featured-image">
              <img 
                src={getImageUrl(featuredImage)} 
                alt={title || 'Featured'} 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}

          {summary && (
            <div className="article-preview-summary-box">
              <h5>Summary</h5>
              <p className="mb-0">{summary}</p>
            </div>
          )}

          {content && (
            <div className="mb-4">
              <h5>Content</h5>
              <EditorContent editor={editor} />
            </div>
          )}

          {referenceRanges && referenceRanges.length > 0 && (
            <div className="mb-4">
              <h5>Reference Ranges</h5>
              <BootstrapTable striped bordered hover responsive className="reference-ranges-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Range</th>
                    <th>Unit</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceRanges.map((range, index) => (
                    <tr key={index}>
                      <td>{range.parameter}</td>
                      <td>{range.range}</td>
                      <td>{range.unit}</td>
                      <td>{range.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </BootstrapTable>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ArticlePreview;
