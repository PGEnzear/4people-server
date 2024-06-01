export enum ERROR_CODES {
    
    //запрос на сервер совершает не с приложения телеграмма
    "UNAUTHORIZED" = "UNAUTHORIZED",

    //нельзя запустить игру, она уже запущена
    "GAME_ALREADY_STARTED" = "GAME_ALREADY_STARTED",

    //недостаточно игроков, для начала игры
    "NOT_ENOUGH_MEMBERS" = "NOT_ENOUGH_MEMBERS",

    //
    "CELL_ALREADY_OPEN" = "CELL_ALREADY_OPEN",

    //слишком много пользователей в игре, нельзя подключится
    "TO_MANY_USERS_IN_ROOM" = "TO_MANY_USERS_IN_ROOM",

    //пользователь уже существует, нельзя зарегистрироваться
    "USER_ALREADY_EXISTS" = "USER_DOES_NOT_EXISTS",

    //пользователь, которые отправил запрос не найден в базе данных,
    "USER_DOES_NOT_EXIST" = "USER_DOES_NOT_EXIST",

    //комнаты в которой пользователь пытается совершить действие несуществует/пользователь не может с ней взаимодействовать(не является её участником)
    "ROOM_DOES_NOT_EXIST" = "ROOM_DOES_NOT_EXIST",

    //пользователь находится уже в другой комнате, нельзя создать свою или зайти в другую
    "IN_ANOTHER_ROOM" = "IN_ANOTHER_ROOM",

    //нельзя выйти из комнаты во время игры    
    "CANT_DISCONNECT_IN_PROGRESS_GAME" = "CANT_DISCONNECT_IN_PROGRESS_GAME",

    //уже в комнате, нельзя подключиться к игре
    "IN_ROOM" = "IN_ROOM",

    //недостаточно денег для создания игры
    "NOT_ENOUGH_MONEY" = "NOT_ENOUGH_MONEY",

    //пользователь пытается совершить ход не в свою очередь
    "NOT_YOUR_TURN" = "NOT_YOUR_TURN",

    //ошибка сервера
    "SERVER_ERROR" = "SERVER_ERROR",

    //неверное тело запроса
    "INVALID_BODY" = "INVALID_BODY"

}