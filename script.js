        // DOM elements
        const inputCode = document.getElementById('input-code');
        const outputCode = document.getElementById('output-code');
        const inputLines = document.getElementById('input-lines');
        const inputChars = document.getElementById('input-chars');
        const outputLines = document.getElementById('output-lines');
        const outputChars = document.getElementById('output-chars');
        const formatBtn = document.getElementById('format-btn');
        const copyBtn = document.getElementById('copy-btn');
        const clearBtn = document.getElementById('clear-btn');
        const statusText = document.getElementById('status-text');
        
        // Options
        const indentTypeSpaces = document.getElementById('spaces');
        const indentTypeTabs = document.getElementById('tabs');
        const indentSize2 = document.getElementById('size-2');
        const indentSize4 = document.getElementById('size-4');
        const wrapAttributes = document.getElementById('wrap-attributes');
        const preserveNewlines = document.getElementById('preserve-newlines');
        
        // Event listeners
        inputCode.addEventListener('input', updateInputStats);
        formatBtn.addEventListener('click', formatHTML);
        copyBtn.addEventListener('click', copyOutput);
        clearBtn.addEventListener('click', clearAll);
        
        // Initialize
        updateInputStats();
        
        // Functions
        function updateInputStats() {
            const text = inputCode.value;
            const lines = text.split('\n').length;
            const chars = text.length;
            
            inputLines.textContent = `Lines: ${lines}`;
            inputChars.textContent = `Characters: ${chars}`;
        }
        
        function updateOutputStats(text) {
            const lines = text.split('\n').length;
            const chars = text.length;
            
            outputLines.textContent = `Lines: ${lines}`;
            outputChars.textContent = `Characters: ${chars}`;
        }
        
        function formatHTML() {
            const html = inputCode.value.trim();
            
            if (!html) {
                statusText.textContent = 'Please enter some HTML code to format.';
                return;
            }
            
            statusText.textContent = 'Formatting HTML...';
            
            // Get formatting options
            const useSpaces = indentTypeSpaces.checked;
            const indentSize = indentSize2.checked ? 2 : 4;
            const shouldWrapAttributes = wrapAttributes.checked;
            const shouldPreserveNewlines = preserveNewlines.checked;
            
            // Format the HTML
            let formatted = '';
            try {
                formatted = formatHTMLCode(html, useSpaces, indentSize, shouldWrapAttributes, shouldPreserveNewlines);
                outputCode.value = formatted;
                updateOutputStats(formatted);
                copyBtn.disabled = false;
                statusText.textContent = 'HTML formatted successfully!';
            } catch (error) {
                statusText.textContent = 'Error formatting HTML. Please check your code.';
                console.error(error);
            }
        }
        
        function formatHTMLCode(html, useSpaces, indentSize, wrapAttributes, preserveNewlines) {
            // Basic HTML formatting function
            let formatted = '';
            let indentLevel = 0;
            let inTag = false;
            let inComment = false;
            let inQuote = false;
            let quoteChar = '';
            let currentLine = '';
            
            // Helper function to add indentation
            const addIndent = () => {
                if (useSpaces) {
                    return ' '.repeat(indentLevel * indentSize);
                } else {
                    return '\t'.repeat(indentLevel);
                }
            };
            
            // Process each character
            for (let i = 0; i < html.length; i++) {
                const char = html[i];
                
                if (inComment) {
                    currentLine += char;
                    if (char === '>' && html.substring(i-2, i) === '--') {
                        inComment = false;
                        formatted += addIndent() + currentLine + '\n';
                        currentLine = '';
                    }
                    continue;
                }
                
                if (inQuote) {
                    currentLine += char;
                    if (char === quoteChar) {
                        inQuote = false;
                    }
                    continue;
                }
                
                if (char === '<') {
                    if (currentLine.trim() && !inTag) {
                        formatted += addIndent() + currentLine + '\n';
                        currentLine = '';
                    }
                    
                    // Check if it's a comment
                    if (html.substring(i, i+4) === '<!--') {
                        inComment = true;
                        currentLine += '<!--';
                        i += 3;
                        continue;
                    }
                    
                    // Check if it's a closing tag
                    if (html[i+1] === '/') {
                        indentLevel = Math.max(0, indentLevel - 1);
                        formatted += addIndent();
                    } else {
                        formatted += addIndent();
                    }
                    
                    inTag = true;
                    currentLine += char;
                } else if (char === '>') {
                    currentLine += char;
                    inTag = false;
                    
                    // Check if it's a self-closing tag
                    const isSelfClosing = currentLine.includes('/>') || 
                                         ['meta', 'link', 'img', 'br', 'hr', 'input'].includes(
                                             currentLine.match(/<([a-zA-Z0-9]+)/)?.[1] || ''
                                         );
                    
                    formatted += currentLine + '\n';
                    currentLine = '';
                    
                    if (!isSelfClosing && html[i-1] !== '/') {
                        // Check if it's an opening tag (not a comment or doctype)
                        const tagMatch = currentLine.match(/<([a-zA-Z0-9]+)/);
                        if (tagMatch && !['!DOCTYPE', '!--'].includes(tagMatch[1])) {
                            indentLevel++;
                        }
                    }
                } else if (char === '"' || char === "'") {
                    inQuote = true;
                    quoteChar = char;
                    currentLine += char;
                } else if (char === '\n' || char === '\r') {
                    // Handle newlines based on preserve setting
                    if (preserveNewlines && currentLine.trim() && !inTag) {
                        formatted += addIndent() + currentLine + '\n';
                        currentLine = '';
                    }
                    // Skip actual newline characters as we add them ourselves
                } else {
                    currentLine += char;
                }
            }
            
            // Add any remaining content
            if (currentLine.trim()) {
                formatted += addIndent() + currentLine;
            }
            
            return formatted.trim();
        }
        
        function copyOutput() {
            if (!outputCode.value) return;
            
            // Copy to clipboard
            navigator.clipboard.writeText(outputCode.value)
                .then(() => {
                    statusText.textContent = 'Formatted HTML copied to clipboard!';
                    
                    // Show temporary success message
                    setTimeout(() => {
                        if (outputCode.value) {
                            statusText.textContent = 'HTML formatted successfully!';
                        } else {
                            statusText.textContent = 'Ready to format. Paste your HTML code and click "Format HTML".';
                        }
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    statusText.textContent = 'Failed to copy to clipboard.';
                });
        }
        
        function clearAll() {
            inputCode.value = '';
            outputCode.value = '';
            updateInputStats();
            updateOutputStats('');
            copyBtn.disabled = true;
            statusText.textContent = 'Cleared. Ready to format new HTML code.';
        }
  
