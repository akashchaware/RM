# RepairingMaster App Prototype

Open `index.html` in a browser to use the prototype.

## Login Portals

- Customer Service: open customer access for repair requests and tracking.
- Device on sell: open buyer access for refurbished devices.
- Apply as Technician, RepairingMaster, Coordinator, or Admin: organization roles submit applications with location.
- Approved Employee Login: approved staff enter their assigned role workspace.

## India Setup

- Platform name changed to RepairingMaster.
- Demo customers, technicians, partners, and addresses are India-based.
- Pricing and revenue are shown in INR.
- Demo login emails use the `repairingmaster.in` domain.
- The provided logo is copied into the app as `logo.png`.
- RepairingMasters can upload refurbished devices to Device on sell.
- Device on sell listings show a 10% owner/platform commission and RepairingMaster payout.
- Service operations use a dropdown selector inside the app.

The prototype stores demo changes in browser local storage. Use the reset button in the top bar to return to the starting data and portal selector.

## Image System

All images live in `outputs\image\`. Reference them as `image/<filename>` in HTML/JS.

To add a new image:
1. Drop the file into `outputs\image\`
2. Reference it in code — e.g. `<img src="image/your-file.png">`
3. See `image/README.txt` for naming conventions and tips
