import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Autocomplete,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    Collapse,
    Tooltip,
} from '@mui/material';
import {
    Add,
    Delete,
    FilterList,
    Clear,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';

const FILTER_OPERATORS = [
    { value: 'equals', label: 'Equals (=)', types: ['string', 'number', 'boolean', 'date'] },
    { value: 'notEquals', label: 'Not Equals (≠)', types: ['string', 'number', 'boolean', 'date'] },
    { value: 'contains', label: 'Contains', types: ['string'] },
    { value: 'notContains', label: 'Not Contains', types: ['string'] },
    { value: 'startsWith', label: 'Starts With', types: ['string'] },
    { value: 'endsWith', label: 'Ends With', types: ['string'] },
    { value: 'greaterThan', label: 'Greater Than (>)', types: ['number', 'date'] },
    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal (≥)', types: ['number', 'date'] },
    { value: 'lessThan', label: 'Less Than (<)', types: ['number', 'date'] },
    { value: 'lessThanOrEqual', label: 'Less Than or Equal (≤)', types: ['number', 'date'] },
    { value: 'inRange', label: 'In Range', types: ['number', 'date'] },
    { value: 'in', label: 'In List', types: ['string', 'number'] },
    { value: 'notIn', label: 'Not In List', types: ['string', 'number'] },
    { value: 'isNull', label: 'Is Null/Empty', types: ['string', 'number', 'boolean', 'date', 'array'] },
    { value: 'isNotNull', label: 'Is Not Null/Empty', types: ['string', 'number', 'boolean', 'date', 'array'] },
    { value: 'regex', label: 'Regex Match', types: ['string'] },
];

const FilterPanel = ({ filters = [], onFiltersChange, availableFields = [], onClear }) => {
    const [expanded, setExpanded] = useState(true);
    const [filterLogic, setFilterLogic] = useState('AND');

    const handleAddFilter = () => {
        onFiltersChange([...filters, { field: '', operator: 'equals', value: '', type: 'string' }]);
    };

    const handleRemoveFilter = (index) => {
        onFiltersChange(filters.filter((_, i) => i !== index));
    };

    const handleFilterChange = (index, key, value) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [key]: value };

        // Auto-detect type when field changes
        if (key === 'field' && value) {
            // You can enhance this with actual type detection from documents
            newFilters[index].type = 'string';
        }

        onFiltersChange(newFilters);
    };

    const handleLogicChange = (event, newLogic) => {
        if (newLogic !== null) {
            setFilterLogic(newLogic);
        }
    };

    const handleClearAll = () => {
        if (onClear) {
            onClear();
        } else {
            onFiltersChange([]);
        }
    };

    const getOperatorsForType = (type) => {
        return FILTER_OPERATORS.filter(op => op.types.includes(type));
    };

    const renderValueInput = (filter, index) => {
        const { operator, value, type } = filter;

        // No value input needed for these operators
        if (operator === 'isNull' || operator === 'isNotNull') {
            return null;
        }

        // Range input
        if (operator === 'inRange') {
            return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        size="small"
                        label="Min"
                        type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                        value={Array.isArray(value) ? value[0] : ''}
                        onChange={(e) => {
                            const newValue = Array.isArray(value) ? [...value] : ['', ''];
                            newValue[0] = e.target.value;
                            handleFilterChange(index, 'value', newValue);
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default',
                                fontSize: '0.875rem',
                                '& fieldset': { borderColor: 'divider' },
                            },
                        }}
                    />
                    <TextField
                        size="small"
                        label="Max"
                        type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                        value={Array.isArray(value) ? value[1] : ''}
                        onChange={(e) => {
                            const newValue = Array.isArray(value) ? [...value] : ['', ''];
                            newValue[1] = e.target.value;
                            handleFilterChange(index, 'value', newValue);
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default',
                                fontSize: '0.875rem',
                                '& fieldset': { borderColor: 'divider' },
                            },
                        }}
                    />
                </Box>
            );
        }

        // List input
        if (operator === 'in' || operator === 'notIn') {
            return (
                <TextField
                    size="small"
                    label="Values (comma-separated)"
                    placeholder="value1, value2, value3"
                    value={Array.isArray(value) ? value.join(', ') : value}
                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.default',
                            fontSize: '0.875rem',
                            '& fieldset': { borderColor: 'divider' },
                        },
                    }}
                />
            );
        }

        // Boolean input
        if (type === 'boolean') {
            return (
                <FormControl size="small" fullWidth>
                    <Select
                        value={value}
                        onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                        sx={{
                            bgcolor: 'background.default',
                            fontSize: '0.875rem',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                        }}
                    >
                        <MenuItem value="true">True</MenuItem>
                        <MenuItem value="false">False</MenuItem>
                    </Select>
                </FormControl>
            );
        }

        // Default text/number/date input
        return (
            <TextField
                size="small"
                label="Value"
                type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                value={value}
                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                InputLabelProps={type === 'date' ? { shrink: true } : {}}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                        fontSize: '0.875rem',
                        '& fieldset': { borderColor: 'divider' },
                    },
                }}
            />
        );
    };

    const activeFilterCount = filters.filter(f => f.field && f.value !== '' && f.value !== undefined).length;

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
                    <FilterList sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        Filters
                    </Typography>
                    {activeFilterCount > 0 && (
                        <Chip
                            label={activeFilterCount}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                            }}
                        />
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {filters.length > 0 && (
                        <Tooltip title="Clear all filters">
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
                    {/* Filter Logic Toggle */}
                    {filters.length > 1 && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Match:
                            </Typography>
                            <ToggleButtonGroup
                                value={filterLogic}
                                exclusive
                                onChange={handleLogicChange}
                                size="small"
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        px: 1.5,
                                        py: 0.25,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&.Mui-selected': {
                                            bgcolor: 'text.primary',
                                            color: 'background.paper',
                                        },
                                    },
                                }}
                            >
                                <ToggleButton value="AND">All (AND)</ToggleButton>
                                <ToggleButton value="OR">Any (OR)</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    )}

                    {/* Filter Conditions */}
                    {filters.map((filter, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 2.5fr auto',
                                gap: 1,
                                mb: 1.5,
                                alignItems: 'start',
                            }}
                        >
                            {/* Field Selector */}
                            <Autocomplete
                                freeSolo
                                size="small"
                                options={availableFields}
                                value={filter.field}
                                onChange={(e, newValue) => handleFilterChange(index, 'field', newValue || '')}
                                onInputChange={(e, newValue) => handleFilterChange(index, 'field', newValue || '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Field"
                                        placeholder="Select field"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'background.default',
                                                fontSize: '0.875rem',
                                                '& fieldset': { borderColor: 'divider' },
                                            },
                                        }}
                                    />
                                )}
                            />

                            {/* Operator Selector */}
                            <FormControl size="small">
                                <InputLabel>Operator</InputLabel>
                                <Select
                                    value={filter.operator}
                                    label="Operator"
                                    onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                                    sx={{
                                        bgcolor: 'background.default',
                                        fontSize: '0.875rem',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                                    }}
                                >
                                    {getOperatorsForType(filter.type).map((op) => (
                                        <MenuItem key={op.value} value={op.value}>
                                            {op.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Value Input */}
                            {renderValueInput(filter, index)}

                            {/* Remove Button */}
                            <IconButton
                                size="small"
                                onClick={() => handleRemoveFilter(index)}
                                disabled={filters.length === 1}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main' },
                                    '&.Mui-disabled': { color: 'action.disabled' },
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}

                    {/* Add Filter Button */}
                    <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={handleAddFilter}
                        sx={{
                            mt: filters.length > 0 ? 1 : 0,
                            textTransform: 'none',
                            color: 'text.primary',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        Add Filter
                    </Button>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default FilterPanel;
