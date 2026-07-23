/**
 * Console Log Cleanup Verification Tests
 * Ensures all console.log statements were removed from Sprint 1 files
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Console Log Cleanup - Sprint 1', () => {
  const filesToCheck = [
    'src/components/blog/editor/ActionButton.tsx',
    'src/components/blog/editor/MdComponents.tsx',
    'src/context/PostContext.tsx',
    'src/components/blog/editor/GalleryImageCard.tsx',
    'src/components/blog/editor/UploadImageCard.tsx',
    'src/components/blog/editor/MarkdownEditor.tsx',
    'src/components/blog/editor/PostMetadata.tsx',
  ];

  const projectRoot = path.resolve(__dirname, '../../../');

  describe('Source Code Cleanup', () => {
    filesToCheck.forEach((filePath) => {
      it(`should not contain console.log in ${filePath}`, () => {
        const fullPath = path.join(projectRoot, filePath);
        
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Check for console.log
          const hasConsoleLog = content.includes('console.log(');
          
          expect(hasConsoleLog).toBe(false);
        } else {
          // File should exist
          expect(fs.existsSync(fullPath)).toBe(true);
        }
      });

      it(`should not contain console.error in ${filePath}`, () => {
        const fullPath = path.join(projectRoot, filePath);
        
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Check for console.error (except in proper error handling)
          const consoleErrorMatches = content.match(/console\.error\(/g);
          
          // Allow console.error in catch blocks for actual errors
          // but we removed the one from UploadImageCard
          if (filePath.includes('UploadImageCard')) {
            expect(consoleErrorMatches).toBeNull();
          }
        }
      });

      it(`should not contain console.dir in ${filePath}`, () => {
        const fullPath = path.join(projectRoot, filePath);
        
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Check for console.dir
          const hasConsoleDir = content.includes('console.dir(');
          
          expect(hasConsoleDir).toBe(false);
        }
      });
    });
  });

  describe('Dead Code Removal', () => {
    it('should not have submitMetadata dead function in PostMetadata.tsx', () => {
      const fullPath = path.join(projectRoot, 'src/components/blog/editor/PostMetadata.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Should not have the old submitMetadata function
        const hasOldFunction = content.includes('submitMetadata = () =>') && 
                               content.includes('console.log("submit here")');
        
        expect(hasOldFunction).toBe(false);
      }
    });

    it('should not have insertBlock fallback console.log in MarkdownEditor.tsx', () => {
      const fullPath = path.join(projectRoot, 'src/components/blog/editor/MarkdownEditor.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Should not have the fallback console.log
        const hasFallbackLog = content.includes('console.log("insertBlock fallback:');
        
        expect(hasFallbackLog).toBe(false);
      }
    });
  });

  describe('Production Readiness', () => {
    it('should have clean code without debug statements', () => {
      const debugPatterns = [
        /console\.log\([^)]*".*(?:success|error|check|debug).*"[^)]*\)/gi,
        /console\.dir\(/gi,
        /console\.table\(/gi,
        /debugger;/gi,
      ];

      filesToCheck.forEach((filePath) => {
        const fullPath = path.join(projectRoot, filePath);
        
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          debugPatterns.forEach((pattern) => {
            const matches = content.match(pattern);
            
            // Should not have debug patterns
            expect(matches).toBeNull();
          });
        }
      });
    });

    it('should not have commented out console.log statements', () => {
      filesToCheck.forEach((filePath) => {
        const fullPath = path.join(projectRoot, filePath);
        
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Check for commented console.log
          const hasCommentedLog = content.includes('// console.log(') ||
                                  content.includes('/* console.log(');
          
          // In MdComponents, there might be commented code, but check carefully
          if (!filePath.includes('MdComponents')) {
            expect(hasCommentedLog).toBe(false);
          }
        }
      });
    });
  });

  describe('Specific Bug Fixes Verification', () => {
    it('ActionButton: should not log "Saving post success"', () => {
      const fullPath = path.join(projectRoot, 'src/components/blog/editor/ActionButton.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        expect(content).not.toContain('Saving post success');
      }
    });

    it('ActionButton: should not log "Error save post"', () => {
      const fullPath = path.join(projectRoot, 'src/components/blog/editor/ActionButton.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        expect(content).not.toContain('Error save post');
      }
    });

    it('PostContext: should not log "hooks post check"', () => {
      const fullPath = path.join(projectRoot, 'src/context/PostContext.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        expect(content).not.toContain('hooks post check');
      }
    });

    it('GalleryImageCard: should not log "checkload"', () => {
      const fullPath = path.join(projectRoot, 'src/components/blog/editor/GalleryImageCard.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        expect(content).not.toContain('checkload');
      }
    });

    it('UploadImageCard: should not log "Upload progress"', () => {
      const fullPath = path.join(projectRoot, 'src/components/blog/editor/UploadImageCard.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        expect(content).not.toContain('Upload progress:');
      }
    });

    it('MdComponents: should not log "Pre: " in list rendering', () => {
      const fullPath = path.join(projectRoot, 'src/components/blog/editor/MdComponents.tsx');
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        expect(content).not.toContain('console.log("Pre: ", li)');
      }
    });
  });

  describe('File Integrity Check', () => {
    it('all tested files should exist', () => {
      filesToCheck.forEach((filePath) => {
        const fullPath = path.join(projectRoot, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    it('all files should be readable', () => {
      filesToCheck.forEach((filePath) => {
        const fullPath = path.join(projectRoot, filePath);
        
        if (fs.existsSync(fullPath)) {
          expect(() => {
            fs.readFileSync(fullPath, 'utf-8');
          }).not.toThrow();
        }
      });
    });
  });
});
