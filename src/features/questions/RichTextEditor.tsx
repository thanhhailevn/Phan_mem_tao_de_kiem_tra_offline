import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { Button } from '../../components/common/Button';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon, 
  Strikethrough as StrikeIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight 
} from 'lucide-react';
import './RichTextEditor.css';
import 'mathlive';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const mathFieldRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (editor && base64) {
        editor.chain().focus().setImage({ src: base64 }).run();
      }
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const insertMath = () => {
    const mathValue = mathFieldRef.current?.value;
    if (mathValue && editor) {
      editor.chain().focus().insertContent(`$$${mathValue}$$`).run();
      if (mathFieldRef.current) {
        mathFieldRef.current.value = '';
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="rte-container">
      <div className="rte-toolbar">
        {/* Nhóm định dạng text */}
        <div className="rte-toolbar-group">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            title="Đậm"
          >
            <BoldIcon size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            title="Nghiêng"
          >
            <ItalicIcon size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'active' : ''}
            title="Gạch chân"
          >
            <UnderlineIcon size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'active' : ''}
            title="Gạch ngang"
          >
            <StrikeIcon size={16} />
          </Button>
        </div>

        {/* Nhóm danh sách */}
        <div className="rte-toolbar-group">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            title="Danh sách dấu chấm"
          >
            <List size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            title="Danh sách số"
          >
            <ListOrdered size={16} />
          </Button>
        </div>

        {/* Nhóm căn lề */}
        <div className="rte-toolbar-group">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
            title="Căn trái"
          >
            <AlignLeft size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
            title="Căn giữa"
          >
            <AlignCenter size={16} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
            title="Căn phải"
          >
            <AlignRight size={16} />
          </Button>
        </div>
        
        {/* Nhóm Toán học */}
        <div className="math-toolbar-group">
          {/* @ts-ignore */}
          <math-field ref={mathFieldRef} style={{ fontSize: '1rem', minWidth: '150px' }}></math-field>
          <Button type="button" variant="primary" size="sm" onClick={insertMath}>
            Chèn ∑
          </Button>
        </div>
        
        {/* Tải ảnh */}
        <div className="image-upload-wrapper">
          <Button type="button" variant="secondary" size="sm">
            🖼️ Chọn Ảnh
          </Button>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>
      </div>

      <div 
        className="rte-editor-area"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
