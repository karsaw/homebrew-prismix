import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    FormControl,
    Select,
    MenuItem,
    Typography,
    IconButton,
    Paper,
} from '@mui/material';
import { Close, SwapHoriz } from '@mui/icons-material';
import * as Diff from 'diff';

const DocumentComparison = ({ open, onClose, documents }) => {
    const [leftDocId, setLeftDocId] = useState('');
    const [rightDocId, setRightDocId] = useState('');

    const leftDoc = documents.find(d => d.id === leftDocId);
    const rightDoc = documents.find(d => d.id === rightDocId);

    const diffResult = useMemo(() => {
        if (!leftDoc || !rightDoc) return null;

        const leftJson = JSON.stringify(leftDoc.doc, null, 2);
        const rightJson = JSON.stringify(rightDoc.doc, null, 2);

        return Diff.diffLines(leftJson, rightJson);
    }, [leftDoc, rightDoc]);

    const handleSwap = () => {
        const temp = leftDocId;
        setLeftDocId(rightDocId);
        setRightDocId(temp);
    };

    const renderDiff = () => {
        if (!diffResult) {
            return (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Select two documents to compare
                </Typography>
            );
        }

        return (
            <Box sx={{ display: 'flex', gap: 2, height: '500px' }}>
                {/* Left Side */}
                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {leftDoc?.id}
                        </Typography>
                    </Box>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 2,
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '0.8125rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {diffResult.map((part, index) => {
                            if (part.removed) {
                                return (
                                    <Box
                                        key={index}
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            bgcolor: 'rgba(255, 0, 0, 0.1)',
                                            borderLeft: '3px solid',
                                            borderColor: 'error.main',
                                            pl: 1,
                                            my: 0.5,
                                        }}
                                    >
                                        {part.value}
                                    </Box>
                                );
                            }
                            if (!part.added) {
                                return <span key={index}>{part.value}</span>;
                            }
                            return null;
                        })}
                    </Box>
                </Paper>

                {/* Right Side */}
                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {rightDoc?.id}
                        </Typography>
                    </Box>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 2,
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '0.8125rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {diffResult.map((part, index) => {
                            if (part.added) {
                                return (
                                    <Box
                                        key={index}
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            bgcolor: 'rgba(0, 255, 0, 0.1)',
                                            borderLeft: '3px solid',
                                            borderColor: 'success.main',
                                            pl: 1,
                                            my: 0.5,
                                        }}
                                    >
                                        {part.value}
                                    </Box>
                                );
                            }
                            if (!part.removed) {
                                return <span key={index}>{part.value}</span>;
                            }
                            return null;
                        })}
                    </Box>
                </Paper>
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '80vh',
                },
            }}
        >
            <DialogTitle
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pr: 2,
                    py: 2,
                }}
            >
                <Typography variant="h6" component="div" fontWeight={600}>
                    Compare Documents
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Document Selectors */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <FormControl fullWidth size="small">
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                            Left Document
                        </Typography>
                        <Select
                            value={leftDocId}
                            onChange={(e) => setLeftDocId(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="">
                                <em>Select document</em>
                            </MenuItem>
                            {documents.map((doc) => (
                                <MenuItem key={doc.id} value={doc.id} disabled={doc.id === rightDocId}>
                                    {doc.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <IconButton
                        onClick={handleSwap}
                        disabled={!leftDocId || !rightDocId}
                        sx={{ mt: 2.5 }}
                    >
                        <SwapHoriz />
                    </IconButton>

                    <FormControl fullWidth size="small">
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                            Right Document
                        </Typography>
                        <Select
                            value={rightDocId}
                            onChange={(e) => setRightDocId(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="">
                                <em>Select document</em>
                            </MenuItem>
                            {documents.map((doc) => (
                                <MenuItem key={doc.id} value={doc.id} disabled={doc.id === leftDocId}>
                                    {doc.id}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Diff View */}
                {renderDiff()}
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DocumentComparison;
