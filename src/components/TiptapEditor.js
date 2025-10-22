import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ImageUploader from './ImageUploader';
import './TiptapEditor.css';

const TiptapEditor = ({ value, onChange, placeholder }) => {
  const { t } = useTranslation();
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder || t('editor.placeholder'),
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const handleImageUpload = (imageData) => {
    editor.chain().focus().setImage({ src: imageData.url, alt: imageData.alt || '' }).run();
    setShowImageModal(false);
  };

  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl('');
    setShowLinkDialog(false);
  };

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkDialog(true);
  };

  return (
    <div className="tiptap-editor-notion">
      <div className="tiptap-toolbar-notion">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title={t('editor.bold')}
        >
          <i className="bi bi-type-bold"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title={t('editor.italic')}
        >
          <i className="bi bi-type-italic"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title={t('editor.strikethrough')}
        >
          <i className="bi bi-type-strikethrough"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
          title={t('editor.code')}
        >
          <i className="bi bi-code"></i>
        </button>

        <div className="toolbar-divider"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title={t('editor.heading1')}
        >
          <i className="bi bi-type-h1"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title={t('editor.heading2')}
        >
          <i className="bi bi-type-h2"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title={t('editor.heading3')}
        >
          <i className="bi bi-type-h3"></i>
        </button>

        <div className="toolbar-divider"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title={t('editor.bulletList')}
        >
          <i className="bi bi-list-ul"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title={t('editor.orderedList')}
        >
          <i className="bi bi-list-ol"></i>
        </button>

        <div className="toolbar-divider"></div>

        {/* Link & Image */}
        <button
          type="button"
          onClick={toggleLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          title={t('editor.link')}
        >
          <i className="bi bi-link-45deg"></i>
        </button>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          title={t('editor.image')}
        >
          <i className="bi bi-image"></i>
        </button>

        <div className="toolbar-divider"></div>

        {/* Code Block & Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title={t('editor.codeBlock')}
        >
          <i className="bi bi-code-square"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title={t('editor.quote')}
        >
          <i className="bi bi-quote"></i>
        </button>

        <div className="toolbar-divider"></div>

        {/* Table */}
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={editor.isActive('table') ? 'is-active' : ''}
          type="button"
          title={t('editor.table')}
        >
          <i className="bi bi-table"></i>
        </button>
      </div>

      <EditorContent editor={editor} className="editor-content-notion" />

      {/* Image Upload Modal */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-image me-2"></i>
            {t('editor.insertImage')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImageUploader
            onUploadSuccess={handleImageUpload}
            onUploadError={(error) => console.error('Image upload error:', error)}
          />
        </Modal.Body>
      </Modal>

      {/* Link Dialog */}
      <Modal 
        show={showLinkDialog} 
        onHide={() => setShowLinkDialog(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-link-45deg me-2"></i>
            {t('editor.insertLink')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor="link-url">{t('editor.url')}</Form.Label>
            <Form.Control
              id="link-url"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSetLink();
                }
              }}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowLinkDialog(false)}
          >
            <i className="bi bi-x-circle me-2"></i>
            {t('editor.cancel')}
          </Button>
          {editor.isActive('link') && (
            <Button
              variant="danger"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setShowLinkDialog(false);
              }}
            >
              <i className="bi bi-trash me-2"></i>
              {t('editor.removeLink')}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSetLink}
          >
            <i className="bi bi-check-circle me-2"></i>
            {t('editor.insert')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TiptapEditor;