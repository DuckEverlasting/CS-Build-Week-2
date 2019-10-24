import styled from 'styled-components';

export const SC = {
    App: styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    `,
    Title: styled.h1`
    `,
    Select: styled.select`
        position: fixed;
        right: 20px;
        top: 20px;
    `,
    SplitBox: styled.div`
        margin: 10px 0;
        width: 1200px;
        display: flex;
        justify-content: space-around;
    `,
    PlayerBox: styled.div`
        border: 2px solid grey;
        border-radius: 10px;
        padding: 10px;
        width: 43%;
        display: flex;
        flex-direction: column;
        text-align: left;
    `,
    RoomBox: styled.div`
        border: 2px solid grey;
        border-radius: 10px;
        padding: 10px;
        width: 43%;
        display: flex;
        flex-direction: column;
        text-align: left;
    `,
    ItemBox: styled.div`
        border: 2px solid grey;
        border-radius: 10px;
        padding: 10px;
        width: 43%;
        display: flex;
        flex-direction: column;
        text-align: left;
    `,
    MessageBox: styled.div`
        border: 2px solid grey;
        border-radius: 10px;
        padding: 10px;
        height: 150px;
        width: 80%;
        overflow-y: scroll;
    `,
    ErrorBox: styled.div`
        border: 2px solid grey;
        border-radius: 10px;
        padding: 10px;
        height: 150px;
        width: 80%;
        overflow-y: scroll;
    `,
    MapBox: styled.div`
        width: 70vw;
        height: 70vh;
        border: 5px solid black;
    `,
    MapWindow: styled.div`
        display: flex;
    `
}