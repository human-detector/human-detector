Feature: Camera detection

    Scenario: Human is detected
        Given a human walks into frame
        When a human is detected
        Then a notification will be sent

    Scenario: Unauthorized cCamera
        Given a human walks into frame
        When a human is detected
        Then a notification fails to send

    Scenario: No human is detected
        Given a human is not in frame
        When a human is not detected
        Then a notification will not be sent
