
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import { AutoAwesome, Close, Send } from '@mui/icons-material';
import { generateQuery } from '../services/aiService';

const AiQueryDialog = ({ open, onClose, onGenerate, schema }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aiConfig, setAiConfig] = useState(null);

    useEffect(() => {
        if (open) {
            const savedSettings = localStorage.getItem('ai-settings');
            if (savedSettings) {
                setAiConfig(JSON.parse(savedSettings));
            } else {
                setAiConfig(null);
            }
            setPrompt('');
            setError(null);
        }
    }, [open]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        if (!aiConfig || !aiConfig.apiKey) {
            setError('AI settings not configured. Please go to Settings > AI Integration.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const jsonString = await generateQuery(
                aiConfig.provider,
                aiConfig.apiKey,
                aiConfig.model,
                schema,
                prompt
            );

            // Validate JSON
            const query = JSON.parse(jsonString);
            onGenerate(query);
            onClose();
        } catch (err) {
            console.error('Generation failed:', err);
            setError(err.message || 'Failed to generate query. Please check your API key and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={!loading ? onClose : undefined}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AutoAwesome sx={{ color: '#9c27b0' }} />
                    <Typography variant="h6" fontWeight={600}>
                        Generate with AI
                    </Typography>
                </Box>
                {!loading && (
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {!aiConfig?.apiKey ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        AI integration is not configured. Please add your API key in Settings.
                    </Alert>
                ) : (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Describe the data you want to find in natural language. The AI will generate a Mango query for you.
                        </Typography>
                        <TextField
                            autoFocus
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="e.g., Find all users who live in New York and are older than 25..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'background.paper',
                                }
                            }}
                        />
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} disabled={loading} sx={{ color: 'text.secondary' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim() || !aiConfig?.apiKey}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                    sx={{
                        bgcolor: '#9c27b0',
                        '&:hover': { bgcolor: '#7b1fa2' },
                        minWidth: 120
                    }}
                >
                    {loading ? 'Generating...' : 'Generate'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AiQueryDialog;
