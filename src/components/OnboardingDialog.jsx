import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Stepper,
    Step,
    StepLabel,
    Paper
} from '@mui/material';
import {
    ArrowForward,
    Check,
    Storage,
    Search,
    Assessment
} from '@mui/icons-material';

const OnboardingDialog = () => {
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        // Check if onboarding has been completed
        const hasCompletedOnboarding = localStorage.getItem('prismix-onboarding-completed');
        if (!hasCompletedOnboarding) {
            setOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            handleClose();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleClose = () => {
        localStorage.setItem('prismix-onboarding-completed', 'true');
        setOpen(false);
    };

    const steps = [
        {
            label: 'Welcome to Prismix',
            description: 'The modern, visual way to manage your CouchDB databases.',
            icon: <Box sx={{ fontSize: 64, mb: 2 }}>👋</Box>
        },
        {
            label: 'Connect Easily',
            description: 'Connect to any CouchDB instance securely. Your credentials stay local.',
            icon: <Storage sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        },
        {
            label: 'Visual Query Builder',
            description: 'Build complex Mango queries without writing JSON manually.',
            icon: <Search sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
        },
        {
            label: 'Database Stats',
            description: 'Monitor your database health with the new Statistics Dashboard.',
            icon: <Assessment sx={{ fontSize: 64, color: '#ffb74d', mb: 2 }} />
        }
    ];

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 4,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {steps[activeStep].icon}
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        {steps[activeStep].label}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 400 }}>
                        {steps[activeStep].description}
                    </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map((step) => (
                            <Step key={step.label}>
                                <StepLabel></StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                boxShadow: 'none'
                            }}
                        >
                            {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingDialog;
