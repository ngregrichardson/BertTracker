package frc.robot;

/**
 * Calculates position based on encoders
 */
public class Tracker {

    // Instance
    static Tracker instance;

    // Variables
    double prevX, prevY, prevTheta, driveTrainWidth;
    boolean setup = false;

    // Empty constructor
    private Tracker() {
    }

    // Returns instance, creates new one if one doesn't exist
    public static Tracker getInstance() {
        if (instance == null)
            instance = new Tracker();
        return instance;
    }

    // Sets up the tracker with start position and drive train width
    public void setup(double startX, double startY, double startTheta, double driveTrainWidth) {
        this.prevX = startX;
        this.prevY = startY;
        this.prevTheta = startTheta;
        this.driveTrainWidth = driveTrainWidth;
        setup = true;
    }

    // Calculate
    public void calculate(double delLeft, double delRight) {
        // Check if set up
        if (!setup) {
            System.out.println("Run setup()");
            return;
        }

        // Calculate deltaTheta
        double delTheta = (delLeft - delRight) / driveTrainWidth;
        double diff = 0;
        double halfWidth = driveTrainWidth * 0.5;

        // Get the difference in the sides
        if (delLeft > delRight) {
            diff = ((driveTrainWidth * delRight) / (delLeft - delRight)) + halfWidth;
        } else if (delLeft < delRight) {
            diff = ((driveTrainWidth * delLeft) / (delRight - delLeft)) + halfWidth;
        } else {
            diff = Double.MAX_VALUE;
        }

        // Calculate forward and sideways deltas
        double delForward = diff * Math.sin(Math.abs(delTheta));
        double delStrafe = diff - (diff * Math.cos(delTheta));

        // Calculate change in x and y
        double delX = (delForward * Math.cos(Math.toRadians(450 - prevTheta)))
                + (delStrafe * Math.cos(Math.toRadians(450 - (prevTheta + 90))));
        double delY = (delForward * Math.sin(Math.toRadians(450 - prevTheta)))
                + (delStrafe * Math.sin(Math.toRadians(450 - (prevTheta + 90))));

        // Add the change to the previous readings
        prevX += delX;
        prevY += delY;
        prevTheta += Math.toDegrees(delTheta);
    }

    /**
     * Returns calculated x value
     */
    public double getX() {
        return prevX;
    }

    /**
     * Returns calculated y value
     */
    public double getY() {
        return prevY;
    }

    /**
     * Returns calculated angle (continuous)
     */
    public double getAngle() {
        return prevTheta;
    }

    /**
     * Returns calculated angle (constrained)
     */
    public double getHeading() {
        return prevTheta % 360;
    }

    /**
     * Resets all previous values to 0
     */
    public void reset() {
        prevX = 0;
        prevY = 0;
        prevTheta = 0;
    }

}