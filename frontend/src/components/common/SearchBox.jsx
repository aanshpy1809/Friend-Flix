import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { Link } from 'react-router-dom';

const SearchBox = ({parent}) => {
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const defaultProfilePic = "https://www.gravatar.com/avatar/?d=mp";

    const { data: users, isLoading } = useQuery({
        queryKey: ["allUsers"],
        queryFn: async () => {
            try {
                const res = await fetch('/api/user');
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong!");
                }
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        }
    });

    const handleSearchChange = (e) => {
        if (users) {
            const fuse = new Fuse(users, {
                keys: ["username", "fullName", "email"]
            });
            const search = e.target.value;
            setSearch(search);
            if (search) {
                const results = fuse.search(search);
                const filtered = search ? results.map((result) => result.item) : users;
                setFilteredUsers(filtered);
                setShowDropdown(true);
            } else {
                setShowDropdown(false);
            }
        }
    };


    return (
        <div className="relative w-64 ">
            <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                onFocus={() => search && setShowDropdown(true)}
                className="input input-bordered w-full rounded-full px-4 py-2 h-10 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                placeholder="Search Users..."
            />
            {showDropdown && (

                <ul className="fixed z-20 bg-base-100 shadow-lg max-h-screen overflow-y-auto ">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((option, index) => (
                            <Link to={parent==="chat"?`/chat/${option._id}`:`/profile/${option.username}`}>
                                <li
                                    key={index}
                                    className="p-2 hover:bg-base-200 cursor-pointer"
                                    
                                >
                                    <div className="flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer">
                                        <div className={`avatar`}>
                                            <div className='w-12 rounded-full'>
                                                <img
                                                    src={option.profileImg ? option.profileImg : defaultProfilePic}
                                                    alt='user avatar'
                                                />
                                            </div>
                                        </div>

                                        <div className='flex flex-col flex-1'>
                                            <div className='flex gap-3 justify-between'>
                                                <p className='font-bold text-gray-200'>{option.fullName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </Link>
                            
                        ))
                    ) : (
                        <li className="p-2">No results found</li>
                    )}
                </ul>
            )}
        </div>
    )
}

export default SearchBox;
