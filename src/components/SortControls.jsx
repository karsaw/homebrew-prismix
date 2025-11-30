import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    FormControl,
    Select,
    MenuItem,
    Chip,
    Tooltip,
    Collapse,
} from '@mui/material';
import {
    Add,
    Delete,
    Sort,
    Clear,
    ArrowUpward,
    ArrowDownward,
    ExpandMore,
    ExpandLess,
    DragIndicator,
} from '@mui/icons-material';

const SortControls = ({ sortConfig = [], onSortChange, availableFields = [], onClear }) => {
    const [expanded, setExpanded] = useState(true);

    const handleAddSort = () => {
        onSortChange([...sortConfig, { field: '', direction: 'asc', type: 'string' }]);
    };

    const handleRemoveSort = (index) => {
        onSortChange(sortConfig.filter((_, i) => i !== index));
    };

    const handleSortChange = (index, key, value) => {
        const newSortConfig = [...sortConfig];
        newSortConfig[index] = { ...newSortConfig[index], [key]: value };
        onSortChange(newSortConfig);
    };

    const handleToggleDirection = (index) => {
        const newSortConfig = [...sortConfig];
        newSortConfig[index].direction = newSortConfig[index].direction === 'asc' ? 'desc' : 'asc';
        onSortChange(newSortConfig);
    };

    const handleMoveSort = (index, direction) => {
        const newSortConfig = [...sortConfig];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < sortConfig.length) {
            [newSortConfig[index], newSortConfig[targetIndex]] = [newSortConfig[targetIndex], newSortConfig[index]];
            onSortChange(newSortConfig);
        }
    };

    const handleQuickSort = (field, direction = 'asc') => {
        // Check if this field is already in sort config
        const existingIndex = sortConfig.findIndex(s => s.field === field);

        if (existingIndex >= 0) {
            // Toggle direction if already exists
            const newSortConfig = [...sortConfig];
            newSortConfig[existingIndex].direction = newSortConfig[existingIndex].direction === 'asc' ? 'desc' : 'asc';
            onSortChange(newSortConfig);
        } else {
            // Add new sort
            onSortChange([...sortConfig, { field, direction, type: 'string' }]);
        }
    };

    const handleClearAll = () => {
        if (onClear) {
            onClear();
        } else {
            onSortChange([]);
        }
    };

    const activeSortCount = sortConfig.filter(s => s.field).length;

    // Quick sort buttons for common fields
    const commonFields = ['_id', '_rev', 'createdAt', 'updatedAt', 'name', 'date'];
    const quickSortFields = commonFields.filter(field => availableFields.includes(field));

    return (
        <Paper
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderBottom: expanded ? '1px solid' : 'none',
                    borderColor: 'divider',
                    cursor: 'pointer',
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Sort sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        Sort
                    </Typography>
                    {activeSortCount > 0 && (
                        <Chip
                            label={activeSortCount}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                bgcolor: 'secondary.main',
                                color: 'secondary.contrastText',
                            }}
                        />
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {sortConfig.length > 0 && (
                        <Tooltip title="Clear all sorting">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearAll();
                                }}
                                sx={{ color: 'text.secondary' }}
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                </Box>
            </Box>

            {/* Content */}
            <Collapse in={expanded}>
                <Box sx={{ p: 2 }}>
                    {/* Quick Sort Buttons */}
                    {quickSortFields.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Quick Sort:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {quickSortFields.map((field) => {
                                    const existingSort = sortConfig.find(s => s.field === field);
                                    const isActive = !!existingSort;
                                    const direction = existingSort?.direction || 'asc';

                                    return (
                                        <Chip
                                            key={field}
                                            label={field}
                                            size="small"
                                            onClick={() => handleQuickSort(field)}
                                            icon={direction === 'asc' ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                                            sx={{
                                                cursor: 'pointer',
                                                bgcolor: isActive ? 'action.selected' : 'background.default',
                                                border: '1px solid',
                                                borderColor: isActive ? 'text.primary' : 'divider',
                                                '&:hover': {
                                                    bgcolor: isActive ? 'action.selected' : 'action.hover',
                                                },
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* Sort Configuration */}
                    {sortConfig.map((sort, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto 3fr auto auto auto',
                                gap: 1,
                                mb: 1.5,
                                alignItems: 'center',
                            }}
                        >
                            {/* Priority Indicator */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {index + 1}
                                </Typography>
                                <DragIndicator sx={{ fontSize: 16, color: 'text.disabled' }} />
                            </Box>

                            {/* Field Selector */}
                            <FormControl size="small" fullWidth>
                                <Select
                                    value={sort.field}
                                    onChange={(e) => handleSortChange(index, 'field', e.target.value)}
                                    displayEmpty
                                    sx={{
                                        bgcolor: 'background.default',
                                        fontSize: '0.875rem',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        <em>Select field</em>
                                    </MenuItem>
                                    {availableFields.map((field) => (
                                        <MenuItem key={field} value={field}>
                                            {field}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Direction Toggle */}
                            <Tooltip title={sort.direction === 'asc' ? 'Ascending' : 'Descending'}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleToggleDirection(index)}
                                    sx={{
                                        color: 'text.primary',
                                        bgcolor: 'action.selected',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    {sort.direction === 'asc' ? (
                                        <ArrowUpward fontSize="small" />
                                    ) : (
                                        <ArrowDownward fontSize="small" />
                                    )}
                                </IconButton>
                            </Tooltip>

                            {/* Move Up/Down */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMoveSort(index, 'up')}
                                    disabled={index === 0}
                                    sx={{
                                        p: 0.25,
                                        color: 'text.secondary',
                                        '&:hover': { color: 'text.primary' },
                                        '&.Mui-disabled': { color: 'action.disabled' },
                                    }}
                                >
                                    <ExpandLess fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMoveSort(index, 'down')}
                                    disabled={index === sortConfig.length - 1}
                                    sx={{
                                        p: 0.25,
                                        color: 'text.secondary',
                                        '&:hover': { color: 'text.primary' },
                                        '&.Mui-disabled': { color: 'action.disabled' },
                                    }}
                                >
                                    <ExpandMore fontSize="small" />
                                </IconButton>
                            </Box>

                            {/* Remove Button */}
                            <IconButton
                                size="small"
                                onClick={() => handleRemoveSort(index)}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main' },
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}

                    {/* Add Sort Button */}
                    <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={handleAddSort}
                        sx={{
                            mt: sortConfig.length > 0 ? 1 : 0,
                            textTransform: 'none',
                            color: 'text.primary',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        Add Sort Column
                    </Button>

                    {/* Sort Priority Info */}
                    {sortConfig.length > 1 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                            Sorting priority: top to bottom
                        </Typography>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default SortControls;
