import React, { useState, useEffect } from 'react';
import axios from "axios";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

interface Login {
    username: string;
    password: string;
}

let Login = () => {
    let [login, setLogin] = useState<Login>({ username: '', password: '' });
    let [message, setMessage] = useState<string>('');
    let [logoutMessage, setLogoutMessage] = useState<string>('');
    let [loggedIn, setLoggedIn] = useState(false);
    let navigate = useNavigate();

    useEffect(() => {
        let fetchAuthorization = async () => {
            try {
                let response = await fetch('/authorize');
                let isAuthorized = await response.json();
                setLoggedIn(isAuthorized);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAuthorization();
    }, []);


    let handleSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLogin({ ...login, [event.target.name]: event.target.value });
    };

    let handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            let response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(login),
            });
            if (response.status == 400) {
                console.log(response.status);
                setMessage('Parse Result Error 400');
            }
            else if (response.status == 403) {
                setMessage('Incorrect Username/Password');
            }
            else if (response.status == 200) {
                setMessage('Logged in successfully');
                setLogoutMessage('');
                console.log(response.body);
                navigate('/api/authors');
                window.location.reload();
            }
        }
        catch (error) {
            console.error(error);
            setMessage('Catch Error');
        }
    };


    let handleLogout = async () => {
        try {
            let response = await fetch('/logout', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setLogoutMessage('Logged out successfully');
                setMessage('');
                window.location.reload();
            } else {
                setLogoutMessage('Logged out failed');
                setMessage('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="content">
                {loggedIn ? (
                    <div>
                        <div className="message">You are already logged in.</div>
                        <div className="logoutMessage">{logoutMessage}</div>
                        <Button variant="contained" type="submit" style={{ backgroundColor: 'maroon' }} onClick={handleLogout}>Logout</Button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="loginForm">
                        <h4>Login</h4>
                        <div>
                            <label htmlFor="username">Username:</label>
                            <input type="text" name="username" value={login.username} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="password">Password:</label>
                            <input type="password" name="password" value={login.password} onChange={handleSubmit} />
                        </div>
                        <div className="message">{message}</div>

                        <Button variant="contained" type="submit" style={{ backgroundColor: 'green' }}>Login</Button>
                    </form>
                )}
            </div>
        </>
    );
};

export default Login;