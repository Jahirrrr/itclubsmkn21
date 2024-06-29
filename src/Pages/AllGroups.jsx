import React from 'react';
import fire from '../config/Fire';
import { Link } from 'react-router-dom';
import { TextField, Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const text = {
    color: "#9c805b"
};

export default class AllGroups extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groups: [],
            searchQuery: '', // Menyimpan kata kunci pencarian
        };
    }

    componentDidMount() {
        this.props.showLoader();
        fire.firestore().collection('groups').get().then(groupsData => {
            const groupsArr = groupsData.docs.map(group => group.id);
            const sortedGroupsArr = groupsArr.sort((a, b) => a.toLowerCase() > b.toLowerCase());
            this.setState({ groups: sortedGroupsArr });
        }).then(this.props.hideLoader);
    }

    // Event handler untuk memperbarui searchQuery saat input berubah
    handleSearchChange = (e) => {
        this.setState({ searchQuery: e.target.value });
    }

    render() {
        const filteredGroups = this.state.groups.filter(group =>
            group.toLowerCase().includes(this.state.searchQuery.toLowerCase())
        );

        return (
            <Container>
                <br></br>
                <Typography color="#9c805b" variant="h5" align="center" gutterBottom>
                    All Groups
                </Typography>
                <TextField
                    sx={{ 
                        "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "#9c805b",
                            },
                          },
                        input: { 
                            color: '#9c805b' 
                        } 
                        }}
                    label="Search"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="normal"
                    value={this.state.searchQuery}
                    onChange={this.handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon style={{ color: '#9c805b' }} />
                        ),
                    }}
                />
                <List>
                    {filteredGroups.map(group => (
                        <ListItem
                            key={group}
                            component={Link}
                            to={`/group/${group}`}
                            button
                        >
                            <ListItemText primaryTypographyProps={{ style: text }} primary={group} />
                        </ListItem>
                    ))}
                </List>
            </Container>
        );
    }
}
