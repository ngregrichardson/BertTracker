package frc.robot;

import com.ctre.phoenix.motorcontrol.FeedbackDevice;
import com.ctre.phoenix.motorcontrol.can.TalonSRX;
import com.kauailabs.navx.frc.AHRS;

import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.wpilibj.SPI;
import edu.wpi.first.wpilibj.TimedRobot;

public class Robot extends TimedRobot {

  // Constants
  final double WHEEL_BASE_WIDTH = 24; // inches
  final double WHEEL_DIAMETER = 6;
  final double PULSES_PER_REV = 4096;

  // Sensors
  AHRS imu;
  TalonSRX leftMotor, rightMotor;
  double prevLeft, prevRight;

  // Get tracker instance
  Tracker tracker = Tracker.getInstance();
  // Create NetworkTable
  NetworkTable table = NetworkTableInstance.getDefault().getTable("tracker");

  @Override
  public void robotInit() {
    // Initialize sensors
    imu = new AHRS(SPI.Port.kMXP);
    leftMotor = new TalonSRX(0);
    rightMotor = new TalonSRX(1);
    leftMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);
    rightMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);

    // Setup tracker
    tracker.setup(0, 0, 0, WHEEL_BASE_WIDTH);
  }

  @Override
  public void robotPeriodic() {
    // Get the current measurements
    double currLeft = getInches(leftMotor.getSelectedSensorPosition());
    double currRight = getInches(rightMotor.getSelectedSensorPosition());

    // Calculate the position based on the difference of encoders
    tracker.calculate(currLeft - prevLeft, currRight - prevRight);

    // Set previous measurements
    prevLeft = currLeft;
    prevRight = currRight;

    // Output to network tables
    table.getEntry("x").setNumber(tracker.getX());
    table.getEntry("y").setNumber(tracker.getY());
    table.getEntry("tAngle").setNumber(tracker.getAngle()); // Output angle calculated by tracker
    table.getEntry("gAngle").setNumber(imu.getAngle()); // Output angle calculated by gyro
  }

  @Override
  public void autonomousInit() {
  }

  @Override
  public void autonomousPeriodic() {
  }

  @Override
  public void teleopPeriodic() {
  }

  @Override
  public void testPeriodic() {
  }

  /**
   * Converts encoder counts to inches
   */
  private double getInches(int counts) {
    return (counts / PULSES_PER_REV) * (Math.PI * WHEEL_DIAMETER);
  }
}
