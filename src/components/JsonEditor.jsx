import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
    Box,
    IconButton,
    Tooltip,
    Paper,
} from '@mui/material';
import {
    ContentCopy,
    FormatAlignLeft,
    Check,
} from '@mui/icons-material';

const JsonEditor = ({
    value,
    onChange,
    readOnly = false,
    height = '400px',
    theme = 'light',
    onSave,
    showToolbar = true,
    onValidate,
}) => {
    const editorRef = useRef(null);
    const [copied, setCopied] = React.useState(false);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Configure JSON language features
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            allowComments: false,
            schemas: [],
            enableSchemaRequest: false,
        });

        // Listen for validation changes
        if (onValidate) {
            const model = editor.getModel();
            monaco.editor.onDidChangeMarkers(() => {
                const markers = monaco.editor.getModelMarkers({ resource: model.uri });
                const errors = markers.filter(marker => marker.severity === monaco.MarkerSeverity.Error);
                onValidate(errors.length === 0, errors.map(e => `Line ${e.startLineNumber}: ${e.message}`));
            });
        }

        // Add keyboard shortcuts
        if (onSave) {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                onSave(editor.getValue());
            });
        }

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
            () => {
                handleFormat();
            }
        );
    };

    const handleFormat = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
        }
    };

    const handleCopy = async () => {
        if (editorRef.current) {
            const text = editorRef.current.getValue();
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    // Convert value to string if it's an object
    const editorValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

    const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            {showToolbar && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        display: 'flex',
                        gap: 0.5,
                    }}
                >
                    <Tooltip title="Format JSON (Ctrl+Shift+F)">
                        <IconButton
                            size="small"
                            onClick={handleFormat}
                            sx={{
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <FormatAlignLeft fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                        <IconButton
                            size="small"
                            onClick={handleCopy}
                            sx={{
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            <Editor
                height={height}
                defaultLanguage="json"
                value={editorValue}
                onChange={onChange}
                onMount={handleEditorDidMount}
                theme={monacoTheme}
                options={{
                    readOnly,
                    minimap: { enabled: !readOnly },
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'always',
                }}
            />
        </Box>
    );
};

export default JsonEditor;
