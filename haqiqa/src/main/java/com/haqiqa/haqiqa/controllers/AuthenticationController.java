    package com.haqiqa.haqiqa.controllers;


    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import com.haqiqa.haqiqa.controllers.responses.LoginResponse;
    import com.haqiqa.haqiqa.dtos.users.LoginUserDto;
    import com.haqiqa.haqiqa.dtos.users.RegisterUserDto;
    import com.haqiqa.haqiqa.dtos.users.UserInfo;
    import com.haqiqa.haqiqa.exceptions.users.InvalidParamsException;
    import com.haqiqa.haqiqa.exceptions.users.UsedEmailException;
    import com.haqiqa.haqiqa.models.User;
    import com.haqiqa.haqiqa.services.AuthenticationService;
    import com.haqiqa.haqiqa.services.JwtService;

    import jakarta.validation.Valid;

    @RequestMapping("/auth")
    @RestController
    public class AuthenticationController {
        private final JwtService jwtService;

        private final AuthenticationService authenticationService;

        public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
            this.jwtService = jwtService;
            this.authenticationService = authenticationService;
        }

        @PostMapping("/signup")
        public ResponseEntity<User> register(@Valid @RequestBody RegisterUserDto registerUserDto) throws UsedEmailException {
            User registeredUser = authenticationService.signup(registerUserDto);

            return ResponseEntity.ok(registeredUser);
        }

        @PostMapping("/login")
        public ResponseEntity<LoginResponse> authenticate(@Valid @RequestBody LoginUserDto loginUserDto) throws InvalidParamsException, Exception {
            User authenticatedUser = authenticationService.authenticate(loginUserDto);

            String jwtToken = jwtService.generateToken(authenticatedUser);
            
            LoginResponse loginResponse = new LoginResponse();

            loginResponse.setExpiresIn(jwtService.getExpirationTime());
            loginResponse.setToken(jwtToken);
            loginResponse.setUserInfo(new UserInfo(authenticatedUser.getId(),
                                            authenticatedUser.getAvatar(),
                                            authenticatedUser.getFirstName(),
                                            authenticatedUser.getLastName(),
                                            authenticatedUser.getEmail()));

            return ResponseEntity.ok(loginResponse);
        }
    }
