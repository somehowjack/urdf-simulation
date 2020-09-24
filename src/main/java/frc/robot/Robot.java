/*----------------------------------------------------------------------------*/
/* Copyright (c) 2020 FIRST. All Rights Reserved.                             */
/* Open Source Software - may be modified and shared by FRC teams. The code   */
/* must be accompanied by the FIRST BSD license file in the root directory of */
/* the project.                                                               */
/*----------------------------------------------------------------------------*/

package frc.robot;

import edu.wpi.first.wpilibj.TimedRobot;
import edu.wpi.first.wpilibj.GenericHID;
import edu.wpi.first.wpilibj.XboxController;
import edu.wpi.first.wpilibj.SpeedControllerGroup;
import edu.wpi.first.wpilibj.drive.DifferentialDrive;
import edu.wpi.first.wpilibj.PWMVictorSPX;

import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableEntry;
import edu.wpi.first.networktables.NetworkTableInstance;

/**
 * This is a sample program to demonstrate the use of state-space classes in robot simulation.
 * This robot has a flywheel, elevator, arm and differential drivetrain, and interfaces with
 * the sim GUI's {@link edu.wpi.first.wpilibj.simulation.Field2d} class.
 */
public class Robot extends TimedRobot {

    XboxController controller = new XboxController(0);

    PWMVictorSPX blMotor = new PWMVictorSPX(0);
    PWMVictorSPX brMotor = new PWMVictorSPX(1);
    PWMVictorSPX flMotor = new PWMVictorSPX(2);
    PWMVictorSPX frMotor = new PWMVictorSPX(3);

    SpeedControllerGroup leftMotors = new SpeedControllerGroup(blMotor, flMotor);
    SpeedControllerGroup rightMotors = new SpeedControllerGroup(brMotor, frMotor);

    DifferentialDrive drive = new DifferentialDrive(leftMotors, rightMotors);
    
    NetworkTable table;

    /**
     * This function is run when the robot is first started up and should be used for any
     * initialization code.
     */
    @Override
    public void robotInit() {
        // get the default instance of NetworkTables
        NetworkTableInstance inst = NetworkTableInstance.getDefault();

        // get a reference to the subtable called "drivebase"
        table = inst.getTable("drivebase");
    }

    @Override
    public void robotPeriodic() {

    }

    @Override
    public void autonomousInit() {

    }

    @Override
    public void autonomousPeriodic() {

    }

    @Override
    public void teleopInit() {

    }

    @Override
    public void teleopPeriodic() {
        double turn = controller.getX(GenericHID.Hand.kLeft);
        double speed = -controller.getY(GenericHID.Hand.kLeft);
        drive.arcadeDrive(speed, turn);
    }

}