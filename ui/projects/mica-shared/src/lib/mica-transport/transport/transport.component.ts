import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { TransportUri } from '../models/transport-uri.model';
import { v4 } from 'uuid';

@Component({
  selector: 'mica-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent implements OnInit {

  private readonly customTypes = ['azure', 'jdbc'];

  @Input() subscriberTypes = ['custom', 'azure', 'http', 'https', 'jdbc', 'mqtt', 'mqtts', 'tcp', 'udp'];
  @Input() uri: string;
  @Output() changeType = new EventEmitter<boolean>();

  type: FormControl;
  connection: FormControl;
  uriInput: FormControl;

  uriForm: FormGroup;
  propertiesForm: FormGroup;
  propsArray: FormArray;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createUriForm();
    this.createTypeControl();
    this.uriInput = this.fb.control({ value: '', disabled: this.type.value !== 'custom' });
    this.createConnectionControl();
    this.editUri();
  }

  saveUri(): string {
    // We don't want to show an error message if clientid is empty.
    // just fill in an autogenerated clientid
    if (this.type.value.startsWith('mqtt')) {
      const clientid = this.uriForm.get('clientid');
      if (clientid.value === null || clientid.value.length === 0) {
        this.uriForm.patchValue({ clientid: v4() });
      }
    }
    this.uri = this.uriInput.value;
    return this.uri;
  }

  private editUri() {
    if (this.uri) {
      const type = TransportUri.getType(this.uri);
      this.type.setValue(type);
      if (this.type.value === 'custom') {
        this.uriInput.setValue(this.uri);
      } else if (this.customTypes.includes(this.type.value)) {
        this.connection.setValue(TransportUri.getRest(this.uri));
      } else {
        const uri = new TransportUri();
        uri.fromString(this.uri);
        this.uriForm.setValue(uri.parsedUri());
      }
      this.uriInput.setValue(this.uri);
    }
  }

  private createConnectionControl() {
    this.connection = this.fb.control('');
    this.connection.valueChanges.subscribe(() => {
      this.uriInput.setValue(this.type.value + '://' + this.connection.value);
    });
  }

  private createTypeControl() {
    this.type = this.fb.control('');
    this.type.valueChanges.subscribe(() => {
      const secure = this.type.value === 'https' || this.type.value === 'mqtts';
      this.changeType.emit(secure);
      if (this.type.value === 'custom') {
        this.uriInput.enable();
        this.uriInput.reset();
      } else if (this.customTypes.includes(this.type.value)) {
        this.uriInput.disable();
        this.connection.setValue('');
      } else {
        this.uriInput.disable();
        if (!this.isSimilarProtocol('mqtt') && !this.isSimilarProtocol('http')) {
          this.uriForm.reset({ protocol: this.type.value, host: '', path: '', topic: '' });
        }
        if (this.isMQTT) {
          this.uriForm.patchValue({ port: this.type.value === 'mqtts' ? 8883 : 1883 });
        }
        this.uriForm.controls['protocol'].setValue(this.type.value);
      }
    });
  }

  private createUriForm() {
    this.uriForm = this.fb.group({
      protocol: [''],
      host: [''],
      port: ['', Validators.compose([Validators.min(1), Validators.max(65535)])],
      path: [''],
      query: [''],
      fragment: [''],
      username: [''],
      password: [''],
      topic: [''],
      clientid: [''],
      qos: ['']
    });
    this.uriForm.valueChanges.subscribe(() => {
      this.createURLString();
    });
  }

  private isSimilarProtocol(protocol: string) {
    return this.uriForm.controls['protocol'].value.startsWith(protocol) && this.type.value.startsWith(protocol);
  }
  private createURLString() {
    const uri = new TransportUri();
    uri.fromUri(this.uriForm.value);
    this.uriInput.setValue(uri.toString());
  }

  get parsable() {
    return TransportUri.parsing.includes(this.type.value);
  }

  get special() {
    return TransportUri.noParsing.includes(this.type.value);
  }

  get isMQTT() {
    return this.type.value.startsWith('mqtt');
  }

  get isHTTP() {
    return this.type.value.startsWith('http');
  }

  get isTcpUdp() {
    return this.type.value.startsWith('tcp') || this.type.value.startsWith('udp');
  }
}
